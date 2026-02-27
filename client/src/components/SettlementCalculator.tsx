import { motion } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function SettlementCalculator() {
  const [volume, setVolume] = useState([500]);
  
  // High-end finance logic:
  // - Daily Volume in Millions
  // - Capital Efficiency Gain: ~0.15% (Typical for T+0 vs T+2/T+3)
  // - Working Days: 252
  const dailyVolume = volume[0] * 1000000;
  const yearlySavings = dailyVolume * 0.0015 * 252;

  return (
    <div className="glass-panel rounded-3xl p-8 md:p-12 border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Efficiency Calculator</h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Quantify the impact of switching from legacy T+2 clearing to AI-driven T+0 settlement.
          </p>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between mb-6">
                <label className="text-white font-medium text-lg">Daily Settlement Volume</label>
                <span className="text-primary font-bold text-2xl tracking-tight">${volume[0] >= 1000 ? (volume[0]/1000).toFixed(1) + 'B' : volume[0] + 'M'}</span>
              </div>
              <Slider 
                value={volume} 
                onValueChange={setVolume} 
                min={100}
                max={10000} 
                step={100}
                className="py-4 cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                <span>$100M</span>
                <span>$10B</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/pricing" className="text-primary hover:text-white transition-colors flex items-center gap-2 font-semibold">
                View Detailed Pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <p className="text-muted-foreground font-medium mb-2 uppercase tracking-widest text-xs">Annual Capital Savings</p>
            <motion.h3 
              key={yearlySavings}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tighter"
            >
              ${yearlySavings >= 1000000000 ? (yearlySavings / 1000000000).toFixed(2) + 'B' : (yearlySavings / 1000000).toFixed(0) + 'M'}
            </motion.h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Liquidity Unlock</p>
                <p className="text-xl font-bold text-white">92.4%</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Operational ROI</p>
                <p className="text-xl font-bold text-white">12.5x</p>
              </div>
            </div>
            
            <Link href="/request-demo" className="mt-8 w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all">
              Request Full Impact Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
