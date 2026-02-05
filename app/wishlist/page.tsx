import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserWishlist } from "@/lib/db/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'My Wishlist | Niki',
  description: 'Your saved items.',
};

export default async function WishlistPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login?callbackUrl=/wishlist');
  }

  const wishlistProducts = await getUserWishlist(session.user.id);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
              <span>/</span>
              <span className="text-white">Wishlist</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">My Wishlist</h1>
          </div>
          <p className="text-zinc-400 font-light">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistProducts.map((product) => (
              <Card 
                key={product.id} 
                product={product} 
                isInWishlist={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 border border-white/10 rounded-2xl bg-zinc-900/20">
            <h3 className="text-2xl font-bold uppercase">Your wishlist is empty</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Save items you love to your wishlist to keep track of them.
            </p>
            <Link 
              href="/products" 
              className="inline-block bg-white text-black font-bold uppercase tracking-wider py-3 px-8 hover:bg-zinc-200 transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
