import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../../components/Header'
import userReducer from '../../store/userSlice'
import cartReducer from '../../store/cartProduct'

// Mock các components con
vi.mock('../../components/Search', () => ({
  default: () => <div data-testid="search-component">Search</div>
}))

vi.mock('../../components/UserMenu', () => ({
  default: ({ close }) => (
    <div data-testid="user-menu">
      <button onClick={close}>Close Menu</button>
    </div>
  )
}))

vi.mock('../../components/DisplayCartItem', () => ({
  default: () => <div data-testid="cart-items">Cart Items</div>
}))

// Mock hooks
vi.mock('../../hooks/useMobile', () => ({
  default: () => [false] // Desktop by default
}))

vi.mock('../../provider/GlobalProvider', () => ({
  useGlobalContext: () => ({
    totalPrice: 100000,
    totalQty: 5
  })
}))

vi.mock('../../utils/isAdmin', () => ({
  default: () => false
}))

// Helper function để tạo mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      cartItem: cartReducer
    },
    preloadedState: initialState
  })
}

// Helper function để render với providers
const renderWithProviders = (ui, { initialState = {} } = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  )
}

describe('Header Component - UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders logo with correct link to home', () => {
    renderWithProviders(<Header />)

    const logoImages = screen.getAllByAltText('logo')
    expect(logoImages.length).toBeGreaterThan(0)

    const homeLink = screen.getAllByRole('link')[0]
    expect(homeLink).toHaveAttribute('href', '/')
  })

  test('renders search component', () => {
    renderWithProviders(<Header />)

    // Search component renders twice (desktop and mobile)
    const searchComponents = screen.getAllByTestId('search-component')
    expect(searchComponents.length).toBeGreaterThanOrEqual(1)
  })

  test('shows login button when user is not logged in', () => {
    const initialState = {
      user: {},
      cartItem: { cart: [] }
    }

    renderWithProviders(<Header />, { initialState })

    // Desktop: Login button should be visible with text "Login"
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  test('shows user account section when user is logged in', () => {
    const initialState = {
      user: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      },
      cartItem: { cart: [] }
    }

    renderWithProviders(<Header />, { initialState })

    // Desktop: Account dropdown should be visible
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  test('displays cart button', () => {
    const initialState = {
      user: { _id: 'user123' },
      cartItem: {
        cart: [
          { _id: 'item1', quantity: 2 },
          { _id: 'item2', quantity: 3 }
        ]
      }
    }

    renderWithProviders(<Header />, { initialState })

    // Cart button displays "Items" text
    expect(screen.getByText(/Items/i)).toBeInTheDocument()
  })

  test('displays account dropdown for logged in user', () => {
    const initialState = {
      user: {
        _id: 'user123',
        name: 'Test User'
      },
      cartItem: { cart: [] }
    }

    renderWithProviders(<Header />, { initialState })

    // Account text with dropdown icon
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  test('displays total price and quantity in cart button', () => {
    const initialState = {
      user: { _id: 'user123' },
      cartItem: {
        cart: [
          { _id: 'item1', quantity: 5 }
        ]
      }
    }

    renderWithProviders(<Header />, { initialState })

    // Should display values from mocked useGlobalContext
    // totalQty: 5 displayed as "5 Items"
    expect(screen.getByText(/5.*Items/i)).toBeInTheDocument()
    // totalPrice: 100000 displayed as "₫1,00,000"
    expect(screen.getByText(/₫1,00,000/)).toBeInTheDocument()
  })

  test('renders logo link correctly', () => {
    renderWithProviders(<Header />)

    const homeLinks = screen.getAllByRole('link')
    const logoLink = homeLinks.find(link => link.getAttribute('href') === '/')
    expect(logoLink).toBeDefined()
  })
})
