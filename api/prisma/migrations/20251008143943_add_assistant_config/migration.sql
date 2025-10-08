-- CreateTable
CREATE TABLE "AssistantConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "brands" TEXT[],
    "models" JSONB NOT NULL,
    "branches" TEXT[],
    "messageLengthMin" INTEGER NOT NULL,
    "messageLengthMax" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "useEmojis" BOOLEAN NOT NULL,
    "additionalInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantConfig_pkey" PRIMARY KEY ("id")
);
