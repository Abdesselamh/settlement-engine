import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CreditCard, Activity, TrendingUp, ShieldCheck, Download, FileText, AlertCircle } from "lucide-react";
import type { User, AuditLog, Invoice } from "@shared/schema";

const volumeData = [
  { month: "Aug", volume: 82, settlements: 120 },
  { month: "Sep", volume: 95, settlements: 145 },
  { month: "Oct", volume: 110, settlements: 180 },
  { month: "Nov", volume: 125, settlements: 210 },
  { month: "Dec", volume: 140, settlements: 240 },
  { month: "Jan", volume: 158, settlements: 275 },
  { month: "Feb", volume: 175, settlements: 310 },
];

const latencyData = [
  { time: "00:00", ms: 0.91 }, { time: "04:00", ms: 0.84 },
  { time: "08:00", ms: 0.79 }, { time: "12:00", ms: 0.88 },
  { time: "16:00", ms: 0.82 }, { time: "20:00", ms: 0.76 },
];

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color || "bg-primary/10"}`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<{ totalUsers: number; activeSubscriptions: number; totalTransactions: number; totalRevenue: number }>({
    queryKey: ["/api/admin/stats"],
  });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({ queryKey: ["/api/admin/audit-logs"] });
  const { data: invoices = [] } = useQuery<Invoice[]>({ queryKey: ["/api/admin/invoices"] });

  function tierBadge(tier?: string | null) {
    if (!tier) return <Badge variant="outline" className="text-muted-foreground">None</Badge>;
    if (tier === "professional") return <Badge className="bg-primary/20 text-primary border-primary/30">Professional</Badge>;
    if (tier === "essential") return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Essential</Badge>;
    return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Custom</Badge>;
  }

  function statusBadge(status?: string | null) {
    if (status === "active") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
    if (status === "canceled") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Canceled</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">None</Badge>;
  }

  function actionIcon(action: string) {
    if (action === "LOGIN") return <ShieldCheck className="w-4 h-4 text-green-400" />;
    if (action === "EXPORT") return <Download className="w-4 h-4 text-blue-400" />;
    if (action.includes("SUBSCRIPTION")) return <CreditCard className="w-4 h-4 text-primary" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-2" data-testid="text-admin-title">Enterprise Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform operations, user management, and financial analytics</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? users.length} sub="Registered accounts" />
            <StatCard icon={CreditCard} label="Active Subscriptions" value={stats?.activeSubscriptions ?? 0} sub="Revenue generating" />
            <StatCard icon={Activity} label="Total Settlements" value={(stats?.totalTransactions ?? 0).toLocaleString()} sub="All-time processed" />
            <StatCard icon={TrendingUp} label="Total Revenue" value={`$${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}K`} sub="Stripe collected" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Settlement Volume ($B/month)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="adminVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="volume" stroke="#00e5ff" fill="url(#adminVolGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Settlement Latency (ms)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0.6, 1.0]} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="ms" fill="#00e5ff" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users">
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-audit">
                <ShieldCheck className="w-4 h-4 mr-2" /> Audit Logs
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-invoices">
                <FileText className="w-4 h-4 mr-2" /> Invoices
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Registered Users</h3>
                  <Badge variant="outline" className="text-muted-foreground">{users.length} total</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Company</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Tier</th>
                        <th className="text-left p-4">Subscription</th>
                        <th className="text-left p-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users yet</td></tr>
                      )}
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`row-user-${user.id}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-muted-foreground text-xs">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{user.company || "—"}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={user.role === "admin" ? "border-amber-500/30 text-amber-400" : "text-muted-foreground"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">{tierBadge(user.subscriptionTier)}</td>
                          <td className="p-4">{statusBadge(user.subscriptionStatus)}</td>
                          <td className="p-4 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit">
              <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Audit Log</h3>
                  <Badge variant="outline" className="text-muted-foreground">{auditLogs.length} events</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left p-4">Action</th>
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Resource</th>
                        <th className="text-left p-4">Details</th>
                        <th className="text-left p-4">IP</th>
                        <th className="text-left p-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No audit events yet</td></tr>
                      )}
                      {auditLogs.map(log => (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`row-audit-${log.id}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {actionIcon(log.action)}
                              <span className="text-white font-mono text-xs">{log.action}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">{log.userEmail || "—"}</td>
                          <td className="p-4 text-muted-foreground text-xs">{log.resource || "—"}</td>
                          <td className="p-4 text-muted-foreground text-xs max-w-xs truncate">{log.details || "—"}</td>
                          <td className="p-4 text-muted-foreground font-mono text-xs">{log.ipAddress || "—"}</td>
                          <td className="p-4 text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Invoices</h3>
                  <Badge variant="outline" className="text-muted-foreground">{invoices.length} total</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left p-4">Invoice</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Plan</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices yet. Complete a Stripe checkout to generate invoices.</td></tr>
                      )}
                      {invoices.map(inv => (
                        <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`row-invoice-${inv.id}`}>
                          <td className="p-4 text-white font-mono text-xs">INV-{String(inv.id).padStart(5, '0')}</td>
                          <td className="p-4 text-muted-foreground text-xs">{inv.userEmail}</td>
                          <td className="p-4">{tierBadge(inv.tier)}</td>
                          <td className="p-4 text-white font-semibold">${Number(inv.amount).toLocaleString()}</td>
                          <td className="p-4"><Badge className="bg-green-500/20 text-green-400 border-green-500/30">PAID</Badge></td>
                          <td className="p-4 text-muted-foreground text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary text-xs hover:underline" data-testid={`link-invoice-pdf-${inv.id}`}>
                              <FileText className="w-3 h-3" /> PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
