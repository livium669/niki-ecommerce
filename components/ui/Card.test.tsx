import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Card from './Card'

// Mock next/link to pass through props (including class and style)
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock WishlistButton to avoid testing its internal logic
vi.mock('../products/WishlistButton', () => ({
  default: () => <button data-testid="wishlist-btn">Wishlist</button>
}))

// Mock useCart
const mockAddItem = vi.fn()
const mockOpenCart = vi.fn()

vi.mock('../CartContext', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    openCart: mockOpenCart,
  }),
}))

const mockProduct = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  category: { name: 'Test Category' },
  price: 100,
  image: '/test-image.jpg',
}

describe('Card Component', () => {
  it('renders product information correctly', () => {
    render(<Card product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
    // The component formats price as USD
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    
    // Now we can use toHaveAttribute thanks to jest-dom
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg')
  })

  it('adds item to cart when button is clicked', () => {
    render(<Card product={mockProduct} />)
    
    // The button text is "Add to Cart"
    const button = screen.getByText('Add to Cart')
    
    fireEvent.click(button)

    expect(mockAddItem).toHaveBeenCalledWith({
      id: mockProduct.id,
      name: mockProduct.name,
      category: mockProduct.category.name,
      price: '$100.00',
      image: mockProduct.image,
    })
    
    expect(mockOpenCart).toHaveBeenCalled()
  })

  it('renders wishlist button', () => {
    render(<Card product={mockProduct} />)
    expect(screen.getByTestId('wishlist-btn')).toBeInTheDocument()
  })
})
