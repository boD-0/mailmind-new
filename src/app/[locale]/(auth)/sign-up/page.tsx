"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "ro";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
const res = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: `/${locale}/onboarding`,
      });
if (res.error) {
        toast.error(res.error.message || "Eroare la înregistrare");
      } else {
        toast.success("Cont creat cu succes!");
        router.push(`/${locale}/onboarding`);
      }
    } catch (err) {
      console.error("Sign up unexpected error:", err);
      toast.error("A apărut o eroare neașteptată");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-obsidian-mid border-border/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-copper">Creare Cont</CardTitle>
          <CardDescription className="text-cream/60">
            Alătură-te MAILMIND și revoluționează modul în care faci outreach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume Complet</Label>
              <Input
                id="name"
                placeholder="Popescu Ion"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
                className="bg-obsidian border-border/20"
              />
            </div>
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
              {loading ? "Se creează contul..." : "Creează cont"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-cream/60">
            Ai deja un cont?{" "}
            <Link href={`/${locale}/login`} className="text-copper hover:underline">
              Autentifică-te
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
