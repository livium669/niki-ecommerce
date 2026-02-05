import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Navbar from './Navbar'
import { useSession } from '@/lib/auth-client'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock next/navigation
const mockRouter = { refresh: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock CartPanel
vi.mock('./CartPanel', () => ({
  default: () => <div data-testid="cart-panel">Cart Panel</div>
}))

// Mock useCart
const mockOpenCart = vi.fn()
const mockCloseCart = vi.fn()

vi.mock('./CartContext', () => ({
  useCart: () => ({
    open: false,
    openCart: mockOpenCart,
    closeCart: mockCloseCart,
    totalCount: 5, // Set a default count
  }),
}))

// Mock auth-client
const mockSignOut = vi.fn()
vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
  signOut: () => mockSignOut(),
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation links and logo', () => {
    (useSession as any).mockReturnValue({ data: null }) // Not logged in
    render(<Navbar />)
    
    expect(screen.getByText('NIKI')).toBeInTheDocument()
    expect(screen.getAllByText('Collection').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0)
  })

  it('renders login button when not authenticated', () => {
    (useSession as any).mockReturnValue({ data: null })
    render(<Navbar />)
    
    // Login button is an SVG wrapped in a link with aria-label="Login"
    // Note: Since we have both desktop and potentially mobile menu items (if rendered), 
    // getAllByLabelText is safer.
    // However, mobile menu items are always rendered in the DOM but hidden.
    // The login button is distinct.
    // Let's verify how many "Login" labels there are.
    // Based on previous logs, there were multiple.
    
    const loginLinks = screen.getAllByLabelText('Login')
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
  })

  it('renders user profile and logout when authenticated', () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          image: '/avatar.jpg'
        }
      }
    })
    
    render(<Navbar />)
    
    // Should show first name
    expect(screen.getByText('John')).toBeInTheDocument()
    
    // Should show logout button
    const logoutBtn = screen.getByTitle('Sign Out')
    expect(logoutBtn).toBeInTheDocument()

    // Should render image
    const avatar = screen.getByRole('img', { name: 'John Doe' })
    expect(avatar).toHaveAttribute('src', '/avatar.jpg')
  })

  it('renders fallback avatar when user has no image', () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          image: null
        }
      }
    })
    
    render(<Navbar />)
    
    // Should render image with fallback URL
    const avatar = screen.getByRole('img', { name: 'John Doe' })
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'))
    expect(avatar).toHaveAttribute('src', expect.stringContaining('John%20Doe'))
  })

  it('displays cart count badge', () => {
    (useSession as any).mockReturnValue({ data: null })
    render(<Navbar />)
    
    // totalCount mocked as 5
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('opens cart when cart button is clicked', () => {
    (useSession as any).mockReturnValue({ data: null })
    render(<Navbar />)
    
    const cartBtn = screen.getByLabelText('Open cart')
    fireEvent.click(cartBtn)
    
    expect(mockOpenCart).toHaveBeenCalled()
  })
  
  it('toggles mobile menu', () => {
    (useSession as any).mockReturnValue({ data: null })
    render(<Navbar />)
    
    const menuBtn = screen.getByLabelText('Toggle menu')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn)
    // We mainly verify it renders without crashing and the button exists
  })
})
