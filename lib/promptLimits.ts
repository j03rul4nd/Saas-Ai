import { prisma } from './prisma';

export interface PromptLimitResult {
  canUse: boolean;
  remainingPrompts: number;
  monthlyLimit: number;
  currentUsage: number;
  nextResetDate: Date;
}

/**
 * Verifica si un usuario puede usar un prompt y actualiza su contador de uso
 */
export async function checkAndIncrementPromptUsage(userId: string): Promise<PromptLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      monthlyPromptLimit: true,
      currentPromptUsage: true,
      lastPromptReset: true,
    },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar si necesitamos hacer reset mensual
  const now = new Date();
  const lastReset = user.lastPromptReset;
  const needsReset = isNewMonth(lastReset, now);

  let currentUsage = user.currentPromptUsage;
  let lastPromptReset = user.lastPromptReset;

  // Si es un nuevo mes, resetear el contador
  if (needsReset) {
    currentUsage = 0;
    lastPromptReset = now;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentPromptUsage: 0,
        lastPromptReset: now,
      },
    });
  }

  const canUse = currentUsage < user.monthlyPromptLimit;
  const remainingPrompts = Math.max(0, user.monthlyPromptLimit - currentUsage);

  // Calcular la próxima fecha de reset (primer día del próximo mes)
  const nextResetDate = getNextResetDate(now);

  return {
    canUse,
    remainingPrompts,
    monthlyLimit: user.monthlyPromptLimit,
    currentUsage,
    nextResetDate,
  };
}

/**
 * Incrementa el contador de uso de prompts de un usuario
 */
export async function incrementPromptUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentPromptUsage: {
        increment: 1,
      },
    },
  });
}

/**
 * Verifica si es un nuevo mes comparando dos fechas
 */
function isNewMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth()
  );
}

/**
 * Calcula la próxima fecha de reset (primer día del próximo mes)
 */
function getNextResetDate(currentDate: Date): Date {
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

/**
 * Obtiene información sobre los límites de prompts de un usuario sin incrementar el contador
 */
export async function getPromptLimitInfo(userId: string): Promise<PromptLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      monthlyPromptLimit: true,
      currentPromptUsage: true,
      lastPromptReset: true,
    },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const now = new Date();
  const needsReset = isNewMonth(user.lastPromptReset, now);
  const currentUsage = needsReset ? 0 : user.currentPromptUsage;
  const remainingPrompts = Math.max(0, user.monthlyPromptLimit - currentUsage);
  const nextResetDate = getNextResetDate(now);

  return {
    canUse: currentUsage < user.monthlyPromptLimit,
    remainingPrompts,
    monthlyLimit: user.monthlyPromptLimit,
    currentUsage,
    nextResetDate,
  };
}

/**
 * Actualiza el límite mensual de prompts de un usuario
 */
export async function updateMonthlyPromptLimit(userId: string, newLimit: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyPromptLimit: newLimit,
    },
  });
}

/**
 * Añade prompts adicionales al límite mensual de un usuario
 */
export async function addPromptsToLimit(userId: string, additionalPrompts: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyPromptLimit: {
        increment: additionalPrompts,
      },
    },
  });
}

/**
 * Resetea el contador de uso de prompts de un usuario (útil para regalos o bonificaciones)
 */
export async function resetPromptUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentPromptUsage: 0,
      lastPromptReset: new Date(),
    },
  });
} 