import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ProductList from '../../components/ProductList'

const mockSuccessResponse = {
  message: 'Product data',
  error: false,
  success: true,
  totalCount: 2,
  totalNoPage: 1,
  data: [
    { _id: 'p1', name: 'Gạo thơm', price: 50000 },
    { _id: 'p2', name: 'Đường', price: 20000 }
  ]
}

const mockEmptyResponse = {
  message: 'No products found',
  error: false,
  success: true,
  totalCount: 0,
  totalNoPage: 0,
  data: []
}

describe('ProductList Component - UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders product list from API successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      })
    )

    render(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText('Gạo thơm')).toBeInTheDocument()
      expect(screen.getByText('Đường')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/products')
  })

  test('renders empty state when no products', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmptyResponse)
      })
    )

    render(<ProductList />)

    await waitFor(() => {
      // Component should render but with no product names
      const productNames = screen.queryByText('Gạo thơm')
      expect(productNames).not.toBeInTheDocument()
    })
  })

  test('handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )

    render(<ProductList />)

    // Component should not crash when fetch fails
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Should not display any products
    expect(screen.queryByText('Gạo thơm')).not.toBeInTheDocument()
  })

  test('handles non-ok response gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: true, message: 'Server error' })
      })
    )

    render(<ProductList />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Component should handle error without crashing
    expect(screen.queryByText('Gạo thơm')).not.toBeInTheDocument()
  })

  test('renders multiple products correctly', async () => {
    const mockManyProducts = {
      ...mockSuccessResponse,
      data: [
        { _id: 'p1', name: 'Gạo thơm', price: 50000 },
        { _id: 'p2', name: 'Đường', price: 20000 },
        { _id: 'p3', name: 'Muối', price: 10000 },
        { _id: 'p4', name: 'Dầu ăn', price: 45000 }
      ]
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockManyProducts)
      })
    )

    render(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText('Gạo thơm')).toBeInTheDocument()
      expect(screen.getByText('Đường')).toBeInTheDocument()
      expect(screen.getByText('Muối')).toBeInTheDocument()
      expect(screen.getByText('Dầu ăn')).toBeInTheDocument()
    })
  })
})