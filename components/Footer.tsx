
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 md:mb-20">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-4xl font-black tracking-tighter mb-8">NIKI</h2>
            <p className="max-w-sm text-gray-500 font-light mb-8 text-sm">
              Join the evolution of kinetic luxury. Sign up for exclusive access to drop schedules and innovation previews.
            </p>
            <div className="flex gap-4">
               <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent border-b border-zinc-700 py-2 w-full max-w-[200px] text-xs focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
               />
               <button className="text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">Join</button>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Store Locator</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-6">Social</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Youtube</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Journal</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] md:text-xs text-zinc-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} NIKI PREMIUM FOOTWEAR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-8">
            <a href="#" className="text-[10px] md:text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[10px] md:text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
