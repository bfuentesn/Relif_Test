import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { AssistantService } from './assistant.service';

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompts de respaldo en caso de que falle la carga de configuración
const FALLBACK_SYSTEM_PROMPT = `You are a sales executive at a Chilean car dealership. Your job is to write a short, human-like follow-up message to re-engage a prospect.`;
const FALLBACK_DEVELOPER_PROMPT = `You will receive context: client name, RUT, and whether the client has overdue debts (hasDebts = true/false). Follow the business rules. Return plain text in Spanish.`;

/**
 * Construye el System Prompt dinámicamente basado en la configuración
 * Este prompt define la personalidad y reglas del asistente
 * @param cfg - Configuración del asistente
 * @returns System Prompt construido
 */
function buildSystemPromptFromConfig(cfg: {
  name: string;
  tone: string;
  language: string;
  models: Record<string, string[]>;
  branches: string[];
  messageLength: { min: number; max: number };
  signature: string;
  useEmojis: boolean;
  additionalInstructions?: string;
}): string {
  const catalog = Object.entries(cfg.models || {})
    .map(([brand, models]) => `${brand} (${(models || []).join(', ')})`)
    .join(', ');
  const branches = (cfg.branches || []).join(', ');
  const toneText = cfg.tone;
  const langText = cfg.language;
  const lengthText = `${cfg.messageLength?.min || 120}–${cfg.messageLength?.max || 180}`;

  const extra = cfg.additionalInstructions ? `\n- Additional guidance: ${cfg.additionalInstructions}` : '';

  // Mapear el tono seleccionado a instrucciones específicas para el modelo
  const toneStyles: Record<string, string> = {
    'profesional': 'Maintain a professional and competent tone. Use formal language but stay approachable. Focus on expertise and reliability.',
    'cercano': 'Keep a friendly yet respectful tone. Use warm language while maintaining professionalism. Show genuine interest in the client\'s needs.',
    'formal': 'Use a very formal and courteous tone. Maintain strict business etiquette. Show utmost respect and protocol.',
    'amigable': 'Use a casual and warm tone. Be conversational and approachable. Create a comfortable, friendly atmosphere.'
  };
  const toneStyle = toneStyles[toneText] || toneStyles['profesional'];

  return `You are "${cfg.name}", a sales executive at a Chilean car dealership. Your job is to write a short, human-like follow-up message to re-engage a prospect.

Business rules:
- Sell only brand-new cars. Catalog: ${catalog}
- Branches: ${branches}
- Financing eligibility: ONLY offer financing if the client has NO overdue debts in our records. If the client has any debts, do NOT offer financing; offer cash alternatives or pre-approval subject to debt regularization.
- Context awareness: If conversation history is provided, use it to write a relevant follow-up that builds on previous interactions. Reference past discussions naturally. Don't be repetitive.

Style and output:
- Output MUST be in ${langText === 'es' ? 'Spanish' : 'English'}, ${lengthText} words.
- Tone instructions: ${toneStyle}
- Include: greeting with client's first name, 1–2 model suggestions (urban/family angle), a clear CTA to schedule a visit to one of the branches, and sign with: "${cfg.signature}".
- Respect privacy; do not disclose internal systems. No hallucinations about unavailable models or branches.
${langText === 'es' ? '- Use Chilean Spanish conventions for numbers (thousand separator ".") and natural date/time phrasing.' : '- Use standard English conventions for numbers and natural date/time phrasing.'}
- Do not include JSON or markdown; return plain text only.${cfg.useEmojis ? ' At most one tasteful emoji is allowed, optional.' : ' Do NOT use any emojis.'}${extra}`;
}

/**
 * Construye el Developer Prompt con instrucciones específicas de formato
 * Define cómo debe manejar la información del cliente y estructurar la respuesta
 * @param cfg - Configuración relevante para el prompt
 * @returns Developer Prompt construido
 */
function buildDeveloperPromptFromConfig(cfg: { 
  messageLength: { min: number; max: number }; 
  signature: string; 
  language: string;
  tone: string;
}) {
  const lengthText = `${cfg.messageLength?.min || 120}–${cfg.messageLength?.max || 180}`;
  const toneStyles: Record<string, string> = {
    'profesional': 'Keep responses professional and solution-focused',
    'cercano': 'Maintain a warm and empathetic approach',
    'formal': 'Use formal language and proper business etiquette',
    'amigable': 'Keep the tone casual and friendly'
  };
  const toneStyle = toneStyles[cfg.tone] || toneStyles['profesional'];

  return `You will receive context: client name, RUT, and whether the client has overdue debts (hasDebts = true/false).
- If hasDebts = true: do NOT offer financing. Mention alternatives (cash payment, or pre-approval conditional upon regularization). ${cfg.tone === 'formal' ? 'Maintain utmost professionalism' : 'Keep a supportive tone'}.
- If hasDebts = false: you MAY offer financing as an option, without promising approval.
- Tone guidance: ${toneStyle}
- Keep the message in the ${lengthText} word range.
- Output MUST be in ${cfg.language === 'es' ? 'Spanish' : 'English'}.
- End with "${cfg.signature}".`;
}

/**
 * Servicio para interactuar con la API de OpenAI
 * Genera mensajes personalizados de seguimiento para clientes
 */
export class AIService {
  /**
   * Genera un mensaje de seguimiento personalizado usando GPT
   * Considera el contexto del cliente (nombre, deudas, historial) y la configuración del asistente
   * @param clientId - ID del cliente para guardar el mensaje generado
   * @param clientName - Nombre del cliente
   * @param rut - RUT del cliente
   * @param hasDebts - Si el cliente tiene deudas pendientes
   * @param recentModelsHint - Pista sobre modelos de interés (opcional)
   * @param conversationHistory - Historial de mensajes previos con el cliente (opcional)
   * @returns Mensaje generado por IA
   */
  static async generateFollowUpMessage(
    clientId: number,
    clientName: string,
    rut: string,
    hasDebts: boolean,
    recentModelsHint?: string,
    conversationHistory?: Array<{ text: string; role: string; sentAt: string }>
  ): Promise<string> {
    try {
      // Obtener configuración del asistente para construir el prompt dinámicamente
      let config: Awaited<ReturnType<typeof AssistantService.getConfig>> | null = null;
      try {
        config = await AssistantService.getConfig();
      } catch (e) {
        // Si falla, continuamos con un fallback
        config = null;
      }

      const systemPrompt = config
        ? buildSystemPromptFromConfig(config)
        : FALLBACK_SYSTEM_PROMPT;
      const developerPrompt = config
        ? buildDeveloperPromptFromConfig({
            messageLength: config.messageLength,
            signature: config.signature,
            language: config.language,
            tone: config.tone
          })
        : FALLBACK_DEVELOPER_PROMPT;

   const lengthText = config?.messageLength
     ? `${config.messageLength.min}–${config.messageLength.max}`
     : '120–180';
   const languageText = config?.language || 'es';

   // Construir el historial de conversaciones si existe
   let conversationContext = '';
   if (conversationHistory && conversationHistory.length > 0) {
     conversationContext = '\n\nConversation History (most recent last):';
     conversationHistory.forEach((msg, index) => {
       const date = new Date(msg.sentAt).toLocaleDateString('es-CL');
       const roleLabel = msg.role === 'client' ? 'Client' : 'Agent';
       conversationContext += `\n[${date}] ${roleLabel}: ${msg.text}`;
     });
     conversationContext += '\n\nIMPORTANT: Use this conversation history to write a contextual follow-up. Reference previous discussions naturally if relevant. Avoid repeating exactly what was said before.';
   } else {
     conversationContext = '\n\nNote: This is the first contact with this client (no previous conversation history).';
   }

   const userPrompt = `Client:
 - Name: ${clientName}
 - RUT: ${rut}
 - Has overdue debts: ${hasDebts}
 Optional hints: ${recentModelsHint || 'No recent model preferences'}${conversationContext}
 
 TASK: Write the message now in ${languageText === 'es' ? 'Spanish' : 'English'}. Plain text only, ${lengthText} words.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: developerPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const generatedText = completion.choices[0]?.message?.content?.trim();
      
      if (!generatedText) {
        throw new Error('No se pudo generar el mensaje');
      }

      // Guardar el mensaje generado automáticamente
      await prisma.message.create({
        data: {
          text: generatedText,
          role: 'agent',
          sentAt: new Date(),
          clientId: clientId
        }
      });

      return generatedText;
    } catch (error) {
      console.error('Error generating AI message:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('authentication')) {
          throw new Error('OpenAI: Error de autenticación - verifica tu API key');
        }
        if (error.message.includes('timeout') || error.message.includes('network')) {
          throw new Error('OpenAI: Error de conexión - intenta nuevamente');
        }
      }
      
      throw new Error('Error generando mensaje de seguimiento');
    }
  }

  /**
   * Prueba la conexión con la API de OpenAI
   * Útil para diagnosticar problemas de configuración
   * @returns true si la conexión es exitosa, false en caso contrario
   */
  static async testConnection(): Promise<boolean> {
    try {
      await openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}
