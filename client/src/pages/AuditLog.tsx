import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Download, CreditCard, Activity, LogIn, FileText, Search } from "lucide-react";
import { useState } from "react";
import type { AuditLog } from "@shared/schema";

function ActionIcon({ action }: { action: string }) {
  if (action === "LOGIN") return <LogIn className="w-4 h-4 text-green-400" />;
  if (action === "EXPORT") return <Download className="w-4 h-4 text-blue-400" />;
  if (action.includes("SUBSCRIPTION")) return <CreditCard className="w-4 h-4 text-primary" />;
  if (action.includes("2FA")) return <ShieldCheck className="w-4 h-4 text-amber-400" />;
  return <Activity className="w-4 h-4 text-muted-foreground" />;
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    LOGIN: "bg-green-500/15 text-green-400 border-green-500/20",
    LOGOUT: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    EXPORT: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    SUBSCRIPTION_CREATED: "bg-primary/15 text-primary border-primary/20",
    SUBSCRIPTION_UPGRADE: "bg-primary/15 text-primary border-primary/20",
    "2FA_SENT": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };
  return (
    <Badge className={`text-xs font-mono ${colors[action] || "bg-white/10 text-muted-foreground border-white/10"}`}>
      {action}
    </Badge>
  );
}

export default function AuditLogPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({ queryKey: ["/api/admin/audit-logs"] });
  const [search, setSearch] = useState("");

  const filtered = logs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.resource || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.details || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gradient" data-testid="text-audit-title">Security Audit Log</h1>
            </div>
            <p className="text-muted-foreground">Immutable record of all platform actions, logins, and configuration changes</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Events", value: logs.length, color: "text-white" },
              { label: "Login Events", value: logs.filter(l => l.action === "LOGIN").length, color: "text-green-400" },
              { label: "Data Exports", value: logs.filter(l => l.action === "EXPORT").length, color: "text-blue-400" },
              { label: "Billing Events", value: logs.filter(l => l.action.includes("SUBSCRIPTION")).length, color: "text-primary" },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-5 rounded-2xl border-white/5">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by action, user, resource, or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-audit-search"
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Logs Table */}
          <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white">Event Timeline</h3>
              <Badge variant="outline" className="text-muted-foreground">{filtered.length} events</Badge>
            </div>
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading audit events...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left p-4">Action</th>
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Resource</th>
                      <th className="text-left p-4">Details</th>
                      <th className="text-left p-4">IP Address</th>
                      <th className="text-left p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No events match your search.</td></tr>
                    )}
                    {filtered.map(log => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`row-log-${log.id}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <ActionIcon action={log.action} />
                            <ActionBadge action={log.action} />
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{log.userEmail || "system"}</td>
                        <td className="p-4 text-muted-foreground text-xs">{log.resource || "—"}</td>
                        <td className="p-4 text-muted-foreground text-xs max-w-xs">{log.details || "—"}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{log.ipAddress || "—"}</td>
                        <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
