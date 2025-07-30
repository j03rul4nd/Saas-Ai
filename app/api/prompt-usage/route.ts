import { NextResponse, NextRequest } from 'next/server'
import { handleApiError, ApiError } from '@/lib/errors'
import { auth } from '@clerk/nextjs/server'
import { getPromptLimitInfo } from '@/lib/promptLimits'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      throw new ApiError(401, 'No autorizado. Debes iniciar sesión para ver tu uso de prompts.')
    }

    // Obtener información sobre el uso de prompts
    const promptInfo = await getPromptLimitInfo(userId)

    return NextResponse.json({
      canUse: promptInfo.canUse,
      remainingPrompts: promptInfo.remainingPrompts,
      monthlyLimit: promptInfo.monthlyLimit,
      currentUsage: promptInfo.currentUsage,
      nextResetDate: promptInfo.nextResetDate,
      usagePercentage: Math.round((promptInfo.currentUsage / promptInfo.monthlyLimit) * 100)
    })

  } catch (error) {
    return handleApiError(error)
  }
} 