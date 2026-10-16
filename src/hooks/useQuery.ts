import { useCallback, useEffect, useState } from 'react'
import { subscribe } from '../api/store'
import { ensureDb } from '../api/seed'

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong.'
}

/**
 * Run an API call and keep the result fresh: it re-runs whenever the
 * database changes (in this tab or another) or `deps` change.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | undefined; error: string | null; loading: boolean }>({
    data: undefined,
    error: null,
    loading: true,
  })
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => subscribe(reload), [reload])

  useEffect(() => {
    let alive = true
    ensureDb()
      .then(fn)
      .then(
        (data) => alive && setState({ data, error: null, loading: false }),
        (e) => alive && setState((s) => ({ ...s, error: errorMessage(e), loading: false })),
      )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps])

  return { ...state, reload }
}

/** Wrap a mutation with pending + error state. */
export function useAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(
    async (...args: A): Promise<{ ok: true; value: R } | { ok: false; value?: undefined }> => {
      setPending(true)
      setError(null)
      try {
        return { ok: true, value: await fn(...args) }
      } catch (e) {
        setError(errorMessage(e))
        return { ok: false }
      } finally {
        setPending(false)
      }
    },
    [fn],
  )
  return { run, pending, error, setError }
}
