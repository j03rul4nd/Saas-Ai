'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Progress } from '@/components/ui/progress'

interface PromptUsageData {
  canUse: boolean
  remainingPrompts: number
  monthlyLimit: number
  currentUsage: number
  nextResetDate: string
  usagePercentage: number
}

interface PromptUsageDisplayProps {
  onUpdate?: (data: PromptUsageData) => void
}

export interface PromptUsageDisplayRef {
  refresh: () => Promise<void>
}

const PromptUsageDisplay = forwardRef<PromptUsageDisplayRef, PromptUsageDisplayProps>(
  ({ onUpdate }, ref) => {
    const [usageData, setUsageData] = useState<PromptUsageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchPromptUsage = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/prompt-usage')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error fetching prompt usage')
        }

        const data = await response.json()
        setUsageData(data)

        if (onUpdate) {
          onUpdate(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    const refresh = async () => {
      setIsRefreshing(true)
      await fetchPromptUsage()
    }

    useImperativeHandle(ref, () => ({
      refresh
    }))

    useEffect(() => {
      fetchPromptUsage()
    }, [])

    if (loading && !isRefreshing) {
      return (
        <div className="bg-black/40 rounded-xl p-6 animate-pulse border border-purple-300/10">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">
            Error: {error}
          </p>
        </div>
      )
    }

    if (!usageData) {
      return null
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getProgressColor = (percentage: number) => {
      if (percentage >= 90) return 'bg-red-500'
      if (percentage >= 75) return 'bg-yellow-500'
      return 'bg-gradient-to-r from-purple-500 to-pink-500'
    }

    return (
      <div className={`bg-black/40 border border-purple-300/10 rounded-xl p-6 transition-all duration-300 ${
        isRefreshing ? 'opacity-75' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-100">
            Monthly Prompt Usage
          </h3>
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              usageData.canUse 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {usageData.canUse ? 'Available' : 'Limit reached'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span className="font-medium text-gray-200">{usageData.currentUsage} / {usageData.monthlyLimit}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(usageData.usagePercentage)}`}
              style={{ width: `${Math.min(usageData.usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 mb-1">Remaining Prompts</p>
            <p className="text-2xl font-bold text-purple-300">
              {usageData.remainingPrompts}
            </p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 mb-1">Next Reset</p>
            <p className="text-sm font-medium text-gray-200 leading-tight">
              {formatDate(usageData.nextResetDate)}
            </p>
          </div>
        </div>

        {!usageData.canUse && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              You’ve reached your monthly prompt limit. Your quota will reset on {formatDate(usageData.nextResetDate)}.
            </p>
          </div>
        )}

        {usageData.usagePercentage >= 75 && usageData.canUse && (
          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-400 text-sm">
              You’re running low on prompts this month. Consider upgrading your plan for more access.
            </p>
          </div>
        )}
      </div>
    )
  }
)

PromptUsageDisplay.displayName = 'PromptUsageDisplay'

export default PromptUsageDisplay
