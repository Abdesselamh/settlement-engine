import { motion } from "framer-motion";
import { Check, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StripeProduct {
  product_id: string;
  product_name: string;
  product_description: string;
  price_id: string;
  unit_amount: number;
  currency: string;
  recurring: any;
}

const tiers = [
  {
    name: "Essential",
    price: "$5,000",
    period: "/mo",
    features: [
      "Up to $1B Monthly Volume",
      "Standard T+0 Settlement",
      "Basic Compliance Suite",
      "Email Support",
    ],
    cta: "Get Started",
    highlight: false,
    stripeTier: "essential",
  },
  {
    name: "Professional",
    price: "$25,000",
    period: "/mo",
    features: [
      "Up to $50B Monthly Volume",
      "Priority Settlement Routing",
      "Advanced AI Fraud Shield",
      "24/7 Dedicated Support",
      "Audit Log Access",
    ],
    cta: "Get Started",
    highlight: true,
    stripeTier: "professional",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited Volume",
      "White-label Integration",
      "On-premise AI Deployment",
      "Custom Compliance Logic",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    highlight: false,
    stripeTier: "custom",
  },
];

export default function Pricing() {
  const [volume, setVolume] = useState([500]);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();

  const dailyVolume = volume[0] * 1000000;
  const yearlySavings = dailyVolume * 0.0015 * 252;

  const { data: stripeProducts = [] } = useQuery<StripeProduct[]>({
    queryKey: ["/api/stripe/products"],
  });

  function getStripePrice(tierName: string): StripeProduct | undefined {
    return stripeProducts.find(p =>
      p.product_name.toLowerCase() === tierName.toLowerCase()
    );
  }

  async function handleCheckout(tier: typeof tiers[0]) {
    if (tier.stripeTier === "custom") {
      window.location.href = "/request-demo";
      return;
    }

    const product = getStripePrice(tier.name);
    if (!product?.price_id) {
      toast({
        title: "Stripe not configured",
        description: "Products are being set up. Please try again shortly or contact sales.",
        variant: "destructive",
      });
      window.location.href = "/request-demo";
      return;
    }

    setLoadingTier(tier.stripeTier);
    try {
      const res = await apiRequest("POST", "/api/stripe/checkout", {
        priceId: product.price_id,
        tier: tier.stripeTier,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Checkout error",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient" data-testid="text-pricing-title">Institutional Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparent, volume-based pricing designed for the scale of global finance.
              Powered by Stripe — secure, instant, and automated.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {tiers.map((tier) => {
              const isLoading = loadingTier === tier.stripeTier;
              return (
                <motion.div
                  key={tier.name}
                  whileHover={{ y: -5 }}
                  className={`glass-panel p-8 rounded-2xl flex flex-col relative ${
                    tier.highlight
                      ? "border-primary/50 bg-primary/5"
                      : "border-white/5"
                  }`}
                  data-testid={`card-tier-${tier.stripeTier}`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${tier.highlight ? "text-primary" : ""}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex gap-3 text-sm text-muted-foreground">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(tier)}
                    disabled={isLoading}
                    data-testid={`button-checkout-${tier.stripeTier}`}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                      tier.highlight
                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : tier.stripeTier === "custom" ? (
                      tier.cta
                    ) : (
                      <><CreditCard className="w-4 h-4" /> {tier.cta}</>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Revenue Calculator */}
          <div className="glass-panel rounded-3xl p-12 border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Settlement Revenue Calculator</h2>
                <p className="text-muted-foreground mb-10">
                  Estimate your annual capital savings by switching to our T+0 AI-driven settlement engine.
                </p>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-4">
                      <label className="text-white font-medium">Daily Settlement Volume</label>
                      <span className="text-primary font-bold text-xl">${volume[0]}M</span>
                    </div>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={10000}
                      step={100}
                      className="py-4"
                      data-testid="slider-volume"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-muted-foreground mb-2">Estimated Annual Savings</p>
                <h3 className="text-5xl md:text-6xl font-bold text-primary mb-6" data-testid="text-savings">
                  ${(yearlySavings / 1000000000).toFixed(2)}B
                </h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Capital Efficiency</p>
                    <p className="text-lg font-bold text-white">+84%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Risk Reduction</p>
                    <p className="text-lg font-bold text-white">99.9%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe badge */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Payments securely processed by Stripe &bull; PCI-DSS Level 1 Compliant
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
