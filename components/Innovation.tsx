
import React from 'react';
import Image from 'next/image';
import { SectionProps } from '../types';

const features = [
  { title: "Kinetic Sole", desc: "Energy return system that adapts to your unique stride geometry." },
  { title: "Aero-Weave", desc: "Seamless single-thread upper construction for zero-gravity feel." },
  { title: "Carbon Core", desc: "Integrated carbon-plate technology for explosive propulsion." },
  { title: "Bio-Response", desc: "Pressure-sensitive cushioning that firms up during high-impact." },
];

const Innovation: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-16 md:py-32 bg-black px-6 relative overflow-hidden">
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 select-none pointer-events-none">
        <span className="text-[30vw] font-black text-white/[0.02] uppercase leading-none">TECH</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <Image 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop" 
              alt="Technology" 
              width={800}
              height={1000}
              className="rounded-3xl grayscale brightness-75 hover:grayscale-0 transition-all duration-1000 w-full h-auto"
            />
            <div className="absolute -bottom-10 -right-10 hidden xl:block">
              <div className="bg-white p-12 rounded-2xl text-black max-w-xs shadow-2xl">
                 <h4 className="text-2xl font-black mb-4 uppercase leading-none">98% Energy Recovery</h4>
                 <p className="text-sm font-light leading-relaxed">Lab-tested propulsion system designed to reduce metabolic cost of movement by nearly 5%.</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-4 block">Innovation Labs</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-12">Beyond Human Limit</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {features.map((f, i) => (
                <div key={i} className="group">
                  <span className="text-xs text-zinc-700 group-hover:text-white transition-colors duration-500 font-mono mb-2 block">0{i + 1}</span>
                  <h4 className="text-xl font-bold uppercase tracking-tight mb-3">{f.title}</h4>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Innovation;
