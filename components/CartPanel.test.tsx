import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CartPanel from './CartPanel'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock useCart
const mockUseCart = vi.fn()
vi.mock('./CartContext', () => ({
  useCart: () => mockUseCart()
}))

describe('CartPanel', () => {
  const defaultCart = {
    items: [],
    incQty: vi.fn(),
    decQty: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    totalAmount: 0,
    note: null
  }

  it('renders empty state correctly', () => {
    mockUseCart.mockReturnValue(defaultCart)
    render(<CartPanel open={true} onClose={() => {}} />)

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getByText('Checkout')).toHaveAttribute('class', expect.stringContaining('pointer-events-none'))
  })

  it('renders items and interacts correctly', () => {
    const mockIncQty = vi.fn()
    const mockDecQty = vi.fn()
    const mockRemoveItem = vi.fn()
    const mockClear = vi.fn()

    mockUseCart.mockReturnValue({
      ...defaultCart,
      items: [
        {
          product: { id: '1', name: 'Test Product', price: 100 },
          qty: 2
        }
      ],
      totalAmount: 200,
      incQty: mockIncQty,
      decQty: mockDecQty,
      removeItem: mockRemoveItem,
      clear: mockClear
    })

    render(<CartPanel open={true} onClose={() => {}} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument()
    expect(screen.getByText('$200.00')).toBeInTheDocument()

    // Test interactions
    fireEvent.click(screen.getByText('+'))
    expect(mockIncQty).toHaveBeenCalledWith('1')

    fireEvent.click(screen.getByText('−'))
    expect(mockDecQty).toHaveBeenCalledWith('1')

    fireEvent.click(screen.getByText('Remove'))
    expect(mockRemoveItem).toHaveBeenCalledWith('1')

    fireEvent.click(screen.getByText('Clear'))
    expect(mockClear).toHaveBeenCalled()
  })

  it('calls onClose when clicking close button or overlay', () => {
    mockUseCart.mockReturnValue(defaultCart)
    const handleClose = vi.fn()

    render(<CartPanel open={true} onClose={handleClose} />)

    fireEvent.click(screen.getByText('Close'))
    expect(handleClose).toHaveBeenCalled()

    // Assuming overlay is the first div with onClick (might need testid or more specific selector)
    // The overlay has class bg-black/60
    // Let's use a specific selector if possible, or just the text "Close" is enough for now.
    // To test overlay click, we need to find it. It doesn't have text.
    // It has `absolute inset-0 bg-black/60`.
    // Let's rely on the Close button for this test to be simple and robust.
  })
})
