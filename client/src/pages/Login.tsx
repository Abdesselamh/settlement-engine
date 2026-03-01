import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Activity, Mail, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "code";

export default function Login() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/auth/2fa/send", { email });
      const data = await res.json();
      setDemoCode(data.demoCode || "");
      setStep("code");
      toast({ title: "Code sent!", description: "Check your email for the 6-digit code." });
    } catch (err: any) {
      setError("Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/auth/2fa/verify", { email, code });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({ title: "Login successful!", description: `Welcome back, ${data.user.name}` });
        if (data.user.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      }
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />
      <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">Secure Login</h1>
            <p className="text-muted-foreground mt-2">Two-Factor Authentication via Email</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border-white/5">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === "email" ? "bg-primary text-primary-foreground" : "bg-green-500/20 text-green-400"}`}>
                <Mail className="w-3 h-3" /> Email
              </div>
              <div className="h-px flex-1 bg-white/10" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === "code" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
                <ShieldCheck className="w-3 h-3" /> Verify
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@institution.com"
                      required
                      data-testid="input-email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="button-send-code"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Verification Code</label>
                  <p className="text-xs text-muted-foreground mb-3">Enter the 6-digit code sent to <span className="text-primary">{email}</span></p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      data-testid="input-code"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors font-mono text-lg tracking-widest"
                    />
                  </div>
                  {demoCode && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400">Demo mode: Your code is <strong className="font-mono">{demoCode}</strong></p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  data-testid="button-verify-code"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); setDemoCode(""); }}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-white transition-colors" data-testid="button-back">
                  ← Back to email
                </button>
              </form>
            )}

            <div className="mt-6 p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span>ISO 27001 Certified &bull; AES-256 Encrypted &bull; SOC 2 Type II</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
