import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CardProduct from '../../components/CardProduct'
import userReducer from '../../store/userSlice'
import cartReducer from '../../store/cartProduct'

// Mock các utility functions
vi.mock('../../utils/DisplayPriceInRupees', () => ({
  DisplayPriceInRupees: (price) => `₹${price}`
}))

vi.mock('../../utils/valideURLConvert', () => ({
  valideURLConvert: (name) => name.toLowerCase().replace(/\s+/g, '-')
}))

vi.mock('../../utils/PriceWithDiscount', () => ({
  pricewithDiscount: (price, discount) => price - (price * discount / 100)
}))

// Mock AddToCartButton component
vi.mock('../../components/AddToCartButton', () => ({
  default: ({ data }) => <button>Add to Cart</button>
}))

// Mock GlobalProvider context
vi.mock('../../provider/GlobalProvider', () => ({
  useGlobalContext: () => ({
    totalPrice: 0,
    totalQty: 0,
    fetchCartItem: vi.fn(),
    updateCartItem: vi.fn(),
    deleteCartItem: vi.fn()
  })
}))

// Mock Axios
vi.mock('../../utils/Axios', () => ({
  default: vi.fn()
}))

const mockProduct = {
  _id: 'product123',
  name: 'Gạo thơm ST25',
  image: ['https://example.com/rice.jpg'],
  price: 50000,
  discount: 10,
  unit: '5kg',
  stock: 100
}

const mockOutOfStockProduct = {
  ...mockProduct,
  _id: 'product456',
  name: 'Đường trắng',
  stock: 0
}

// Helper để render với Redux và Router
const renderWithProviders = (ui, { initialState = {} } = {}) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      cartItem: cartReducer
    },
    preloadedState: initialState
  })

  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  )
}

describe('CardProduct Component - UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders product card with all information', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    expect(screen.getByText('Gạo thơm ST25')).toBeInTheDocument()
    expect(screen.getByText('5kg')).toBeInTheDocument()
    expect(screen.getByText('10% discount')).toBeInTheDocument()
    expect(screen.getByText('₹45000')).toBeInTheDocument() // Price after 10% discount
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  test('renders product image correctly', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProduct.image[0])
  })

  test('renders correct product link', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/product/gạo-thơm-st25-product123')
  })

  test('displays discount badge when product has discount', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    const discountBadge = screen.getByText('10% discount')
    expect(discountBadge).toBeInTheDocument()
    expect(discountBadge).toHaveClass('text-green-600')
  })

  test('does not display discount badge when product has no discount', () => {
    const productWithoutDiscount = { ...mockProduct, discount: 0 }
    renderWithProviders(<CardProduct data={productWithoutDiscount} />)

    expect(screen.queryByText(/discount/i)).not.toBeInTheDocument()
  })

  test('displays "Out of stock" when stock is 0', () => {
    renderWithProviders(<CardProduct data={mockOutOfStockProduct} />)

    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument()
  })

  test('displays "Add to Cart" button when product is in stock', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
  })

  test('calculates price with discount correctly', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    // Original price: 50000, discount: 10%
    // Expected: 45000
    expect(screen.getByText('₹45000')).toBeInTheDocument()
  })

  test('displays delivery time badge', () => {
    renderWithProviders(<CardProduct data={mockProduct} />)

    expect(screen.getByText('10 min')).toBeInTheDocument()
  })
})
