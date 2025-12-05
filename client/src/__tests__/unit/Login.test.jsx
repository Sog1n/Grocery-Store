import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Login from '../../pages/Login'
import { Provider } from 'react-redux'
import { store } from '../../store/store'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import Axios from '../../utils/Axios'
import toast from 'react-hot-toast'

// Mock các modules
vi.mock('../../utils/Axios')
vi.mock('react-hot-toast')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

const renderWithProviders = (ui) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    ),
  })

describe('Login Component - UI Tests', () => {
  let mockNavigate

  beforeEach(() => {
    mockNavigate = vi.fn()
    useNavigate.mockReturnValue(mockNavigate)
    vi.clearAllMocks()
    // Mock localStorage
    Storage.prototype.setItem = vi.fn()
    Storage.prototype.getItem = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders login form with email, password and disabled submit', () => {
    renderWithProviders(<Login />)

    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const button = screen.getByRole('button', { name: /login/i })

    expect(email).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  test('enables submit when both email and password are filled', async () => {
    renderWithProviders(<Login />)

    const user = userEvent.setup()
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const button = screen.getByRole('button', { name: /login/i })

    await user.type(email, 'test@example.com')
    await user.type(password, 'supersecret')

    expect(button).not.toBeDisabled()
  })

  test('toggles password visibility when eye icon clicked', async () => {
    renderWithProviders(<Login />)

    const user = userEvent.setup()
    const password = screen.getByLabelText(/password/i)
    
    // Initial state - password hidden
    expect(password).toHaveAttribute('type', 'password')

    // Find and click toggle icon - click on the parent div that contains the svg
    const toggleDiv = password.parentElement.querySelector('div')
    expect(toggleDiv).toBeInTheDocument()

    await user.click(toggleDiv)

    // Password should be visible
    expect(password).toHaveAttribute('type', 'text')
  })

  test('displays "Forgot password?" link that navigates correctly', () => {
    renderWithProviders(<Login />)

    const forgotLink = screen.getByText(/forgot password/i)
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  test('displays "Register" link that navigates correctly', () => {
    renderWithProviders(<Login />)

    const registerLink = screen.getByText(/register/i)
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  test('submits form successfully and navigates to home', async () => {
    const mockResponse = {
      data: {
        error: false,
        success: true,
        message: 'Login successful',
        data: {
          accesstoken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      }
    }

    Axios.mockResolvedValueOnce(mockResponse)
    
    // Mock fetchUserDetails
    const mockUserDetails = {
      data: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      }
    }
    Axios.mockResolvedValueOnce(mockUserDetails)

    renderWithProviders(<Login />)

    const user = userEvent.setup()
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const button = screen.getByRole('button', { name: /login/i })

    await user.type(email, 'test@example.com')
    await user.type(password, 'password123')
    await user.click(button)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Login successful')
      expect(localStorage.setItem).toHaveBeenCalledWith('accesstoken', 'mock-access-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  test('displays error message when login fails', async () => {
    const mockErrorResponse = {
      data: {
        error: true,
        success: false,
        message: 'Invalid credentials'
      }
    }

    Axios.mockResolvedValueOnce(mockErrorResponse)

    renderWithProviders(<Login />)

    const user = userEvent.setup()
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const button = screen.getByRole('button', { name: /login/i })

    await user.type(email, 'wrong@example.com')
    await user.type(password, 'wrongpass')
    await user.click(button)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  test('handles network error during login', async () => {
    const networkError = new Error('Network error')
    Axios.mockRejectedValueOnce(networkError)

    renderWithProviders(<Login />)

    const user = userEvent.setup()
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const button = screen.getByRole('button', { name: /login/i })

    await user.type(email, 'test@example.com')
    await user.type(password, 'password123')
    await user.click(button)

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
