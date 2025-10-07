import OpenAI from 'openai';
import { prisma } from '../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are "Carla", a sales executive at a Chilean car dealership. Your job is to write a short, human-like follow-up message to re-engage a prospect. 
Business rules:
- Sell only brand-new cars. Catalog: Toyota (Corolla, RAV4), Hyundai (Tucson, Elantra), Chevrolet (Tracker, Onix), Suzuki (Swift), Mazda (CX-5).
- Branches: Providencia, Maipú, La Florida.
- Financing eligibility: ONLY offer financing if the client has NO overdue debts in our records. If the client has any debts, do NOT offer financing; offer cash alternatives or pre-approval subject to debt regularization.
Style and output:
- Output must be written in SPANISH (Chile-neutral), 120–180 words.
- Be warm, concise, and professional. Avoid overpromising and legal/financial guarantees.
- Include: greeting with client's first name, 1–2 model suggestions (urban/family angle), a clear CTA to schedule a visit to one of the branches, and a short signature: "Carla — Automotora".
- Respect privacy; do not disclose internal systems. No hallucinations about unavailable models or branches.
- Use es-CL conventions for numbers (thousand separator ".") and natural date/time phrasing.
- Do not include JSON or markdown; return plain text only. At most one tasteful emoji is allowed, optional.`;

const DEVELOPER_PROMPT = `You will receive context: client name, RUT, and whether the client has overdue debts (hasDebts = true/false). 
- If hasDebts = true: do NOT offer financing. Mention alternatives (cash payment, or pre-approval conditional upon regularization), keep a supportive tone.
- If hasDebts = false: you MAY offer financing as an option, without promising approval.
- Keep the message in the 120–180 word range.
- End with "Carla — Automotora".`;

export class AIService {
  static async generateFollowUpMessage(
    clientId: number,
    clientName: string,
    rut: string,
    hasDebts: boolean,
    recentModelsHint?: string
  ): Promise<string> {
    try {
      const userPrompt = `Client:
- Name: ${clientName}
- RUT: ${rut}
- Has overdue debts: ${hasDebts}
Optional hints: ${recentModelsHint || 'No recent model preferences'}

TASK: Write the message now in SPANISH (Chile-neutral). Plain text only, 120–180 words.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: DEVELOPER_PROMPT },
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
