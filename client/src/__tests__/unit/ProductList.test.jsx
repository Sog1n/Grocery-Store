import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ProductList from '../../components/ProductList' // chỉnh đường dẫn nếu khác

const mockResponse = {
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

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders product list from API', async () => {
  render(<ProductList />)

  await waitFor(() => {
    expect(screen.getByText('Gạo thơm')).toBeInTheDocument()
    expect(screen.getByText('Đường')).toBeInTheDocument()
  })
})