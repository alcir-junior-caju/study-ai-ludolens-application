import { useState, useCallback } from 'react'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (url: string, init?: RequestInit) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, init)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Erro: ${response.status}`)
        }

        const result = await response.json()
        const responseData = result.data || result

        setData(responseData)
        options?.onSuccess?.(responseData)

        return responseData
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        options?.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
  }
}
