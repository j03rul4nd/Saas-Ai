import { useState, useEffect, useCallback, useRef } from 'react'

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
  forceRefresh: () => Promise<void>
}

export function usePromptUsage(): UsePromptUsageReturn {
  const [usageData, setUsageData] = useState<PromptUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchTime = useRef<number>(0)
  const isFetching = useRef<boolean>(false)

  const fetchUsageData = useCallback(async (force = false) => {
    // Evitar múltiples llamadas simultáneas
    if (isFetching.current && !force) {
      return
    }

    // Cache de 5 segundos para evitar llamadas innecesarias
    const now = Date.now()
    if (!force && lastFetchTime.current && (now - lastFetchTime.current) < 5000) {
      return
    }

    try {
      isFetching.current = true
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompt-usage', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener el uso de prompts')
      }

      const data = await response.json()
      setUsageData(data)
      lastFetchTime.current = now
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [])

  const refreshUsage = useCallback(async () => {
    await fetchUsageData(false)
  }, [fetchUsageData])

  const forceRefresh = useCallback(async () => {
    await fetchUsageData(true)
  }, [fetchUsageData])

  const checkUsage = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/prompt-usage')
      
      if (!response.ok) {
        return false
      }

      const data = await response.json()
      setUsageData(data)
      lastFetchTime.current = Date.now()
      return data.canUse
    } catch (err) {
      console.error('Error checking prompt usage:', err)
      return false
    }
  }, [])

  useEffect(() => {
    fetchUsageData(true)
  }, [fetchUsageData])

  return {
    usageData,
    loading,
    error,
    refreshUsage,
    checkUsage,
    forceRefresh
  }
} 