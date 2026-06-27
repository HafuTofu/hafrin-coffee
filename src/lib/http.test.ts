import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchJson } from './http'

describe('fetchJson helper', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('fetches JSON successfully', async () => {
    const mockData = { hello: 'world' }
    const mockResponse = {
      ok: true,
      headers: {
        get: (name: string) => name === 'content-type' ? 'application/json' : null,
      },
      json: async () => mockData,
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

    const result = await fetchJson('/api/test')
    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: {
        Accept: 'application/json',
      }
    }))
  })

  it('throws an error on non-OK response with JSON error message', async () => {
    const mockError = { error: 'Bad Request' }
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: {
        get: (name: string) => name === 'content-type' ? 'application/json' : null,
      },
      json: async () => mockError,
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    const promise = fetchJson('/api/error', { retries: 0 })
    await expect(promise).rejects.toThrow('HTTP 400: Bad Request')
  })

  it('throws an error on non-OK response with raw text message', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Error',
      headers: {
        get: () => 'text/html',
      },
      text: async () => '<h1>Database Error</h1>',
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    const promise = fetchJson('/api/text-error', { retries: 0 })
    await expect(promise).rejects.toThrow('HTTP 500: Database Error')
  })

  it('throws error when response is not JSON', async () => {
    const mockResponse = {
      ok: true,
      headers: {
        get: () => 'text/html',
      },
      text: async () => 'Not JSON',
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    const promise = fetchJson('/api/non-json', { retries: 0 })
    await expect(promise).rejects.toThrow('Invalid response (expected JSON): Not JSON')
  })

  it('retries on failure and succeeds eventually', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 500,
      statusText: 'Temporary Error',
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'Temp Error' }),
    }
    const mockSuccessResponse = {
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    }

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockErrorResponse as any)
      .mockResolvedValueOnce(mockSuccessResponse as any)

    const promise = fetchJson('/api/retry', { retries: 2, timeoutMs: 1000 })
    
    // Resolve the backoff timers
    await vi.advanceTimersByTimeAsync(1000)

    const result = await promise
    expect(result).toEqual({ success: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('aborts the fetch if it times out', async () => {
    let signal: AbortSignal | null | undefined
    vi.mocked(fetch).mockImplementation(async (url, init) => {
      signal = init?.signal
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(new DOMException('The user aborted a request.', 'AbortError'))
        }
        signal?.addEventListener('abort', () => {
          reject(new DOMException('The user aborted a request.', 'AbortError'))
        })
      })
    })

    const promise = fetchJson('/api/timeout', { retries: 0, timeoutMs: 100 })
    const assertion = expect(promise).rejects.toThrow('The user aborted a request.')
    
    // Fast forward the timeout
    await vi.advanceTimersByTimeAsync(150)
    
    await assertion
  })
})
