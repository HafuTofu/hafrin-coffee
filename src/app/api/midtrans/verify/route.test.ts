import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './route'
import { Order } from '@/models/order'
import { NextResponse } from 'next/server'

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/models/order', () => ({
  Order: {
    findById: vi.fn(),
  },
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      status: init?.status ?? 200,
      body,
      json: async () => body,
    })),
  },
}))

describe('Midtrans Verify API Route', () => {
  const envBackup = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    process.env.MIDTRANS_SERVER_KEY = 'dummy-server-key'
    process.env.MIDTRANS_BASE_URL = 'https://api.sandbox.midtrans.com'
  })

  afterEach(() => {
    process.env = { ...envBackup }
    vi.unstubAllGlobals()
  })

  it('returns 400 when orderId is missing', async () => {
    const req = new Request('http://localhost/api/midtrans/verify')
    const res = await GET(req) as any

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ success: false, error: 'Missing orderId' })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, error: 'Missing orderId' },
      { status: 400 }
    )
  })

  it('returns 404 when order is not found in database', async () => {
    vi.mocked(Order.findById).mockResolvedValueOnce(null)

    const req = new Request('http://localhost/api/midtrans/verify?orderId=nonexistent')
    const res = await GET(req) as any

    expect(Order.findById).toHaveBeenCalledWith('nonexistent')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Order not found' })
  })

  it('returns immediately if order is already marked paid', async () => {
    const mockOrder = {
      _id: 'paid-order-id',
      paymentStatus: 'paid',
      toObject: () => ({ _id: 'paid-order-id', paymentStatus: 'paid' }),
    }
    vi.mocked(Order.findById).mockResolvedValueOnce(mockOrder)

    const req = new Request('http://localhost/api/midtrans/verify?orderId=paid-order-id')
    const res = await GET(req) as any

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      verified: true,
      paymentStatus: 'paid',
      order: { _id: 'paid-order-id', paymentStatus: 'paid' },
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns unverified if MIDTRANS_SERVER_KEY is not configured', async () => {
    delete process.env.MIDTRANS_SERVER_KEY
    const mockOrder = {
      _id: 'pending-order-id',
      paymentStatus: 'pending',
      toObject: () => ({ _id: 'pending-order-id', paymentStatus: 'pending' }),
    }
    vi.mocked(Order.findById).mockResolvedValueOnce(mockOrder)

    const req = new Request('http://localhost/api/midtrans/verify?orderId=pending-order-id')
    const res = await GET(req) as any

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      verified: false,
      paymentStatus: 'pending',
      reason: 'no_server_key',
      order: { _id: 'pending-order-id', paymentStatus: 'pending' },
    })
  })

  it('fetches status from Midtrans and updates order to paid if capture/settlement', async () => {
    const mockSave = vi.fn().mockResolvedValue(true)
    const mockOrder = {
      _id: 'pending-order-id',
      paymentStatus: 'pending',
      statusHistory: [] as any[],
      save: mockSave,
      toObject: () => ({ _id: 'pending-order-id', paymentStatus: 'paid' }),
    }
    vi.mocked(Order.findById).mockResolvedValueOnce(mockOrder)

    const mockFetchResponse = {
      ok: true,
      json: async () => ({
        transaction_status: 'settlement',
      }),
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse as any)

    const req = new Request('http://localhost/api/midtrans/verify?orderId=pending-order-id')
    const res = await GET(req) as any

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'https://api.sandbox.midtrans.com/v2/pending-order-id/status',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Basic ZHVtbXktc2VydmVyLWtleTo=', // base64 of 'dummy-server-key:'
        }),
      })
    )

    expect(mockOrder.paymentStatus).toBe('paid')
    expect(mockOrder.statusHistory).toContainEqual(
      expect.objectContaining({ status: 'midtrans:verified:settlement' })
    )
    expect(mockSave).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      success: true,
      verified: true,
      paymentStatus: 'paid',
    }))
  })

  it('returns 502 if Midtrans status fetch returns non-OK status', async () => {
    vi.mocked(Order.findById).mockResolvedValueOnce({
      _id: 'pending-order-id',
      paymentStatus: 'pending',
    })

    const mockFetchResponse = {
      ok: false,
      status: 401,
      json: async () => ({ error_messages: ['Unauthorized'] }),
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse as any)

    const req = new Request('http://localhost/api/midtrans/verify?orderId=pending-order-id')
    const res = await GET(req) as any

    expect(res.status).toBe(502)
    expect(res.body).toEqual({
      success: false,
      error: 'Midtrans status fetch failed',
      details: { error_messages: ['Unauthorized'] },
    })
  })
})
