import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock, Globe } from "lucide-react";

export default function RequestDemo() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      message: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/leads", data);
      toast({
        title: "Inquiry Received",
        description: "Our institutional team will contact you within 12 hours.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit request. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="tech-bg-animation" />
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gradient">Request a Demo</h1>
              <p className="text-xl text-muted-foreground mb-12">
                Join the world's leading financial institutions in the transition to AI-driven instant settlement.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Secure Consultation</h4>
                    <p className="text-muted-foreground">All inquiries are handled with strict institutional confidentiality.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">SOC2 Type II Compliant</h4>
                    <p className="text-muted-foreground">Your data is protected by industry-leading security protocols.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Global Presence</h4>
                    <p className="text-muted-foreground">Serving banks across 40+ jurisdictions with local compliance expertise.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 md:p-12 rounded-3xl border-white/5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@bank.com" {...field} className="bg-white/5 border-white/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Central Bank" {...field} className="bg-white/5 border-white/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Head of Liquidity" {...field} className="bg-white/5 border-white/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your settlement requirements..." 
                            {...field} 
                            className="bg-white/5 border-white/10 min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Processing..." : "Submit Secure Request"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
