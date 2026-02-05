'use client';

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getUserOrders } from '@/lib/actions/order';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Fetch addresses when tab changes to addresses
  React.useEffect(() => {
    if (activeTab === 'addresses' && session) {
      setLoadingAddresses(true);
      fetch('/api/profile/addresses')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setAddresses(data);
            }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingAddresses(false));
    }
  }, [activeTab, session]);

  // Fetch orders when tab changes to orders
  React.useEffect(() => {
    if (activeTab === 'orders' && session) {
      setLoadingOrders(true);
      getUserOrders()
        .then(data => {
            setOrders(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, session]);

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      line1: formData.get('line1'),
      line2: formData.get('line2'),
      city: formData.get('city'),
      state: formData.get('state'),
      country: formData.get('country'),
      postalCode: formData.get('postalCode'),
      isDefault: formData.get('isDefault') === 'on',
    };

    try {
      const res = await fetch('/api/profile/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newAddress = await res.json();
        setAddresses([...addresses, newAddress]);
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };


  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Go Back
        </button>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase">
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex flex-col items-center text-center p-6 bg-neutral-900/50 rounded-lg border border-white/10">
              <div className="relative w-32 h-32 mb-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 128px"
                    className="rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center border-2 border-white/20">
                    <span className="text-4xl font-bold text-white/50">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wide mb-1">{user.name}</h2>
              <p className="text-sm text-neutral-400 mb-6">{user.email}</p>
              
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`text-left py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-white text-black' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`text-left py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'addresses' 
                    ? 'bg-white text-black' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`text-left py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-white text-black' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Order History</h3>
                
                {loadingOrders ? (
                   <div className="flex justify-center py-20">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                   </div>
                ) : orders.length === 0 ? (
                  <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-2">No orders yet</h4>
                    <p className="text-neutral-400 max-w-sm mb-6">
                      You haven't placed any orders yet. Check out our latest collection to find your perfect pair.
                    </p>
                    <Link 
                      href="/"
                      className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-neutral-900/30 border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-neutral-900/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
                          <div className="flex flex-wrap gap-8">
                            <div>
                              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Order Placed</p>
                              <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total</p>
                              <p className="font-bold text-sm">${order.totalAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Order ID</p>
                              <p className="font-mono text-sm text-neutral-300">{order.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              order.status === 'paid' ? 'bg-green-500/20 text-green-500' : 
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-700 text-neutral-300'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-6">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center text-neutral-600 font-bold text-xs">
                                    IMG
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold uppercase mb-1">{item.variant?.product?.name || 'Product'}</h4>
                                  <p className="text-sm text-neutral-400 mb-1">Quantity: {item.quantity}</p>
                                  <p className="font-bold text-sm">${item.priceAtPurchase}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-2xl font-bold uppercase tracking-tight">Saved Addresses</h3>
                  {!showAddressForm && (
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="text-xs font-bold uppercase tracking-widest border-b border-white pb-1 hover:opacity-70 transition-opacity"
                    >
                      + Add New
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="bg-neutral-900/30 border border-white/10 rounded-xl p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Address Line 1</label>
                        <input name="line1" required className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" placeholder="Street address" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Address Line 2 (Optional)</label>
                        <input name="line2" className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" placeholder="Apartment, suite, etc." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">City</label>
                        <input name="city" required className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">State / Province</label>
                        <input name="state" required className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Country</label>
                        <input name="country" required className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Postal Code</label>
                        <input name="postalCode" required className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="isDefault" id="isDefault" className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-black focus:ring-0" />
                      <label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Set as default address</label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="submit" className="py-3 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors rounded-full text-xs">
                        Save Address
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAddressForm(false)}
                        className="py-3 px-8 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors rounded-full text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {loadingAddresses ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-neutral-900/30 border border-white/10 rounded-xl p-6 relative group">
                            {addr.isDefault && (
                              <span className="absolute top-4 right-4 text-[10px] bg-white text-black px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                Default
                              </span>
                            )}
                            <div className="space-y-1 text-sm text-neutral-300">
                              <p className="font-bold text-white mb-2">{addr.line1}</p>
                              {addr.line2 && <p>{addr.line2}</p>}
                              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                              <p>{addr.country}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold mb-2">No addresses saved</h4>
                        <p className="text-neutral-400 max-w-sm">
                          Save your shipping and billing addresses for faster checkout.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Account Settings</h3>
                <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Display Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user.name}
                      className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      disabled
                      className="w-full bg-neutral-800/50 border border-white/5 rounded-lg p-3 text-neutral-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-neutral-500">Email address cannot be changed for security reasons.</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button className="py-3 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors rounded-full text-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
