// Small fetch helper with timeout and retries for client-side requests
export type FetchJsonOptions = RequestInit & {
  timeoutMs?: number
  retries?: number
}

export async function fetchJson<T = any>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { timeoutMs = 8000, retries = 2, ...init } = options

  let attempt = 0
  let lastErr: any

  while (attempt <= retries) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...init, signal: controller.signal, headers: {
        'Accept': 'application/json',
        ...(init.headers || {}),
      } })
      clearTimeout(id)

      if (!res.ok) {
        // Try to extract JSON error body, else text (trim to keep UI clean)
        const contentType = res.headers.get('content-type') || ''
        const raw: unknown = contentType.includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '')
        const msg = typeof raw === 'string'
          ? raw.replace(/<[^>]+>/g, '').slice(0, 160) || res.statusText || 'Server error'
          : (typeof raw === 'object' && raw && 'error' in raw && typeof (raw as any).error === 'string')
            ? (raw as any).error
            : (typeof raw === 'object' && raw && 'message' in raw && typeof (raw as any).message === 'string')
              ? (raw as any).message
              : res.statusText || 'Unknown error'
        throw new Error(`HTTP ${res.status}: ${msg}`)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '')
        const snippet = text.replace(/<[^>]+>/g, '').slice(0, 160) || 'Non-JSON response'
        throw new Error(`Invalid response (expected JSON): ${snippet}`)
      }

      return await res.json() as T
    } catch (err) {
      clearTimeout(id)
      lastErr = err
      // AbortError or network error -> retry with backoff
      const isAbort = (err as any)?.name === 'AbortError'
      if (attempt < retries && (isAbort || true)) {
        const backoff = 300 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
        await new Promise(r => setTimeout(r, backoff))
        attempt++
        continue
      }
      throw err
    }
  }
  throw lastErr
}
