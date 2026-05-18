"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect } from "react";

const BRAND_VALUES = [
  "Inovație", "Exclusivitate", "Integritate", "Eficiență", 
  "Empatie", "Transparență", "Sustenabilitate", "Calitate"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/${locale}/sign-up`);
    }
  }, [session, isPending, router, locale]);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    toneOfVoice: "",
    targetAudience: "",
    context: "",
  });

  const toggleValue = (value: string) => {
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value) 
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.industry) {
      toast.error("Te rugăm să completezi numele brandului și industria.");
      return;
    }

    setLoading(true);
    try {
      // Avem nevoie de headerele cererii pentru auth în server action
      // În mod normal Next.js le injectează dacă folosim direct action în form, 
      // dar aici facem apel manual.
      
      const res = await submitOnboarding({
        ...formData,
        brandValues: selectedValues,
      }); // Notă: Server action-ul preia automat contextul session din headers()

      if (res.success) {
        posthog.capture('onboarding_completed', {
          industry: formData.industry,
          tone_of_voice: formData.toneOfVoice,
          brand_values_count: selectedValues.length,
        });
        toast.success("Onboarding finalizat cu succes!");
        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(res.error || "Ceva nu a mers bine.");
      }
    } catch {
      toast.error("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-copper animate-pulse font-display text-xl">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-obsidian-mid border-border/30 luxury-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display text-copper">Bun venit la MAILMIND</CardTitle>
          <CardDescription className="text-cream/60">
            Să configurăm identitatea brandului tău pentru a începe generarea de outreach strategic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-cream/80">Nume Brand</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: MailMind Solutions" 
                  className="bg-obsidian border-border/20 focus:border-copper"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-cream/80">Industrie</Label>
                <Input 
                  id="industry" 
                  placeholder="Ex: Tehnologie / SaaS" 
                  className="bg-obsidian border-border/20 focus:border-copper"
                  value={formData.industry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-cream/80">Public Țintă</Label>
              <Input 
                id="targetAudience" 
                placeholder="Ex: Fondatori de startup-uri, Directori de vânzări" 
                className="bg-obsidian border-border/20 focus:border-copper"
                value={formData.targetAudience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toneOfVoice" className="text-cream/80">Tonul Vocii (Tone of Voice)</Label>
              <Input 
                id="toneOfVoice" 
                placeholder="Ex: Profesional dar prietenos, Direct și autoritar" 
                className="bg-obsidian border-border/20 focus:border-copper"
                value={formData.toneOfVoice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, toneOfVoice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context" className="text-cream/80">Context adițional / Slogan</Label>
              <Textarea 
                id="context" 
                placeholder="Spune-ne mai multe despre misiunea ta..." 
                className="bg-obsidian border-border/20 focus:border-copper resize-none"
                rows={4}
                value={formData.context}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-cream/80">Valori Brand</Label>
              <div className="flex flex-wrap gap-2">
                {BRAND_VALUES.map(value => (
                  <Badge 
                    key={value}
                    variant={selectedValues.includes(value) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedValues.includes(value) 
                        ? "bg-copper text-obsidian border-copper" 
                        : "bg-transparent border-border/30 text-cream/60 hover:border-copper/50"
                    }`}
                    onClick={() => toggleValue(value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            className="w-full bg-copper hover:bg-copper-light text-obsidian font-bold py-6 transition-all luxury-shadow"
            disabled={loading}
          >
            {loading ? "Se salvează..." : "Finalizează Configurația"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
