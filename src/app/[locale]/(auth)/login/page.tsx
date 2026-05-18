"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const locale = params?.locale || "ro";
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      });

      if (error) {
        toast.error(error.message || "Eroare la autentificare");
      } else {
        toast.success("Autentificare reușită!");
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      toast.error("A apărut o eroare neașteptată");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-obsidian-mid border-border/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-copper">Autentificare</CardTitle>
          <CardDescription className="text-cream/60">
            Introdu datele pentru a intra în contul tău MAILMIND.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nume@companie.ro"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="bg-obsidian border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="bg-obsidian border-border/20"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se încarcă..." : "Intră în cont"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-cream/60">
            Nu ai un cont?{" "}
            <Link href={`/${locale}/sign-up`} className="text-copper hover:underline">
              Înregistrează-te
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
