import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../pages/Login'
import { Provider } from 'react-redux'
import { store } from '../../store/store'
import { MemoryRouter } from 'react-router-dom'

const renderWithProviders = (ui) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    ),
  })

test('renders login form with email, password and disabled submit', async () => {
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
  // initial should be password type
  expect(password).toHaveAttribute('type', 'password')

  // the toggle icon is rendered as an svg inside a clickable div next to the input
  const toggleSvg = password.parentElement.querySelector('svg')
  expect(toggleSvg).toBeInTheDocument()

  await user.click(toggleSvg)

  expect(password).toHaveAttribute('type', 'text')
})
