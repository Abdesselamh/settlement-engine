import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle, Download, Activity, FileText } from "lucide-react";

export default function CheckoutSuccess() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      fetch(`/api/stripe/session/${sessionId}`)
        .then(r => r.json())
        .then(data => { setSessionData(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />
      <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
        <div className="w-full max-w-lg px-4 text-center">
          <div className="glass-panel p-10 rounded-2xl border-white/5">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3" data-testid="text-success-title">Payment Successful!</h1>
            {loading ? (
              <p className="text-muted-foreground">Loading your receipt...</p>
            ) : sessionData ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Your <span className="text-primary font-semibold capitalize">{sessionData.tier}</span> subscription is now active.
                  A confirmation has been sent to <span className="text-white">{sessionData.customerEmail}</span>.
                </p>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-8 text-left">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-white capitalize font-semibold">{sessionData.tier}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-white font-semibold">${((sessionData.amountTotal || 0) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-400 font-semibold">PAID</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mb-6">Your subscription is now active. Welcome to InstantSettlement.ai!</p>
            )}
            <div className="flex gap-3">
              <a href="/dashboard" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-center shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
                data-testid="link-go-to-dashboard">
                <Activity className="w-4 h-4 inline mr-2" />Launch Dashboard
              </a>
              <a href="/admin" className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 transition-all"
                data-testid="link-view-invoice">
                <FileText className="w-4 h-4 inline mr-2" />View Invoice
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
