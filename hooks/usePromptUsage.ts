import { useState, useEffect, useCallback } from 'react'

interface PromptUsageData {
  canUse: boolean
  remainingPrompts: number
  monthlyLimit: number
  currentUsage: number
  nextResetDate: string
  usagePercentage: number
}

interface UsePromptUsageReturn {
  usageData: PromptUsageData | null
  loading: boolean
  error: string | null
  refreshUsage: () => Promise<void>
  checkUsage: () => Promise<boolean>
}

export function usePromptUsage(): UsePromptUsageReturn {
  const [usageData, setUsageData] = useState<PromptUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompt-usage')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener el uso de prompts')
      }

      const data = await response.json()
      setUsageData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUsage = useCallback(async () => {
    await fetchUsageData()
  }, [fetchUsageData])

  const checkUsage = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/prompt-usage')
      
      if (!response.ok) {
        return false
      }

      const data = await response.json()
      setUsageData(data)
      return data.canUse
    } catch (err) {
      console.error('Error checking prompt usage:', err)
      return false
    }
  }, [])

  useEffect(() => {
    fetchUsageData()
  }, [fetchUsageData])

  return {
    usageData,
    loading,
    error,
    refreshUsage,
    checkUsage
  }
} 