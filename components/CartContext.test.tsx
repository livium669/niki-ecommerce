import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock dependencies BEFORE imports to avoid DB connection issues
vi.mock('../lib/actions/cart', () => ({
  syncCart: vi.fn().mockResolvedValue([]),
  updateCartItem: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/auth-client', () => ({
  useSession: vi.fn().mockReturnValue({ data: null }),
}));

import { CartProvider, useCart } from './CartContext'
import { useCartStore } from '../lib/store/cart'

// Helper component to interact with the context
const TestCartConsumer = () => {
  const { items, addItem, removeItem, incQty, decQty, clear, totalCount, totalAmount } = useCart()
  
  const product1 = {
    id: '1',
    name: 'Sneaker A',
    price: 100,
    category: 'Shoes',
    image: '/img1.jpg',
    slug: 'sneaker-a'
  }

  const product2 = {
    id: '2',
    name: 'Sneaker B',
    price: '200', // String price to test parsing
    category: 'Shoes',
    image: '/img2.jpg',
    slug: 'sneaker-b'
  }

  return (
    <div>
      <div data-testid="total-count">{totalCount}</div>
      <div data-testid="total-amount">{totalAmount}</div>
      
      <button onClick={() => addItem(product1 as any)}>Add Product 1</button>
      <button onClick={() => addItem(product2 as any)}>Add Product 2</button>
      <button onClick={() => clear()}>Clear Cart</button>

      <ul>
        {items.map(item => (
          <li key={item.product.id} data-testid={`item-${item.product.id}`}>
            <span data-testid={`qty-${item.product.id}`}>{item.qty}</span>
            <button onClick={() => incQty(item.product.id)}>Inc</button>
            <button onClick={() => decQty(item.product.id)}>Dec</button>
            <button onClick={() => removeItem(item.product.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
    
    // Reset store state
    useCartStore.setState({ 
      items: [], 
      open: false, 
      note: null, 
      isLocalLoaded: false, 
      userEmail: null 
    })
  })

  it('starts with empty cart', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    expect(screen.getByTestId('total-count').textContent).toBe('0')
    expect(screen.getByTestId('total-amount').textContent).toBe('0')
  })

  it('adds items correctly', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    
    fireEvent.click(screen.getByText('Add Product 1'))
    
    expect(screen.getByTestId('total-count').textContent).toBe('1')
    expect(screen.getByTestId('total-amount').textContent).toBe('100')
    expect(screen.getByTestId('item-1')).toBeDefined()
  })

  it('increments quantity for existing items', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    
    fireEvent.click(screen.getByText('Add Product 1'))
    fireEvent.click(screen.getByText('Add Product 1'))
    
    expect(screen.getByTestId('total-count').textContent).toBe('2')
    expect(screen.getByTestId('qty-1').textContent).toBe('2')
    expect(screen.getByTestId('total-amount').textContent).toBe('200')
  })

  it('handles mixed items and calculates total', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    
    fireEvent.click(screen.getByText('Add Product 1')) // 100
    fireEvent.click(screen.getByText('Add Product 2')) // 200
    
    expect(screen.getByTestId('total-count').textContent).toBe('2')
    expect(screen.getByTestId('total-amount').textContent).toBe('300')
  })

  it('removes items', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    
    fireEvent.click(screen.getByText('Add Product 1'))
    fireEvent.click(screen.getByText('Remove'))
    
    expect(screen.getByTestId('total-count').textContent).toBe('0')
    expect(screen.queryByTestId('item-1')).toBeNull()
  })

  it('clears cart', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    )
    
    fireEvent.click(screen.getByText('Add Product 1'))
    fireEvent.click(screen.getByText('Add Product 2'))
    fireEvent.click(screen.getByText('Clear Cart'))
    
    expect(screen.getByTestId('total-count').textContent).toBe('0')
    expect(screen.queryByTestId('item-1')).toBeNull()
    expect(screen.queryByTestId('item-2')).toBeNull()
  })
})
