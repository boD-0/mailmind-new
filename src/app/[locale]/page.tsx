'use client'

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Brain, Target, PenLine, Check, X } from "lucide-react";
import { CopperStreak } from "@/components/ui/CopperStreak";
import { Iris } from "@/components/ui/Iris";
import { useTranslation } from "@/components/I18nProvider";
import { useParams } from "next/navigation";

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.fillStyle = "rgba(193,123,63,0.25)";
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dotI = dots[i];
          const dotJ = dots[j];
          if (!dotI || !dotJ) continue;
          const dx = dotI.x - dotJ.x;
          const dy = dotI.y - dotJ.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(193,123,63,${0.2 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(dotI.x, dotI.y);
            ctx.lineTo(dotJ.x, dotJ.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

const AGENTS = [
  { Icon: Search, name: "Researcher", desc: "Digs into your prospect's company, recent news, LinkedIn presence, tone of writing, and role context. Finds the signal in the noise." },
  { Icon: Brain, name: "Psychologist", desc: "Builds a full OCEAN personality profile from public signals. Knows if your prospect is skeptical, data-driven, or a fast mover — before you write a single word." },
  { Icon: Target, name: "Strategist", desc: "Maps the approach: what angle to lead with, what to avoid, what hook will land for this specific human at this specific moment." },
  { Icon: PenLine, name: "Copywriter", desc: "Writes the email. Not a template. Not a variation. A message tailored to the psychology, context, and strategy the other three agents assembled." },
];

import Link from "next/link";

export default function HomePage() {
  const { t } = useTranslation();
  const { locale } = useParams();
  
  return (
    <div className="min-h-screen bg-[var(--obsidian)] text-cream">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-deep border-b border-[rgba(193,123,63,0.12)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="font-display text-[var(--copper)] tracking-[0.05em]">✦ MAILMIND</Link>
          <div className="hidden md:flex gap-8 text-sm text-cream-50">
            <a href="#how" className="hover:text-cream">{t('nav.how_it_works')}</a>
            <a href="#pricing" className="hover:text-cream">{t('nav.pricing')}</a>
            <a href="#about" className="hover:text-cream">{t('nav.about')}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`} className="text-sm text-cream-50 hover:text-cream px-3 py-2">{t('nav.login')}</Link>
            <Link href={`/${locale}/onboarding`} className="px-4 py-2 bg-[var(--copper)] text-[var(--obsidian)] rounded-md text-sm font-medium hover:bg-[var(--copper-light)] transition-colors">
              {t('nav.start_free')}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
        <ParticleField />
        <div className="relative max-w-[760px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="inline-block px-3 py-1 rounded-full glass text-[11px] tracking-[0.18em] text-[var(--copper)]"
          >
            ✦ {t('hero.badge')}
          </motion.div>
          <motion.h1
            initial={{ filter: "blur(8px)", opacity: 0.3, scale: 0.96 }} animate={{ filter: "blur(0)", opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[44px] md:text-[68px] leading-[1.05] mt-6"
          >
            {t('hero.headline')}
          </motion.h1>
          <p className="mt-6 text-[18px] md:text-[20px] text-cream-70 leading-[1.6] max-w-[580px] mx-auto">
            {t('hero.subheadline')}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/sign-up`} className="copper-shimmer h-12 px-7 inline-flex items-center justify-center bg-[var(--copper)] text-[var(--obsidian)] rounded-md font-medium">
              {t('hero.cta')} →
            </Link>
            <a href="#how" className="h-12 px-7 inline-flex items-center justify-center border border-[var(--copper)] text-cream rounded-md hover:bg-[rgba(193,123,63,0.08)]">
              {t('hero.see_how')}
            </a>
          </div>
          <p className="mt-7 text-[13px] text-cream-30">{t('hero.trusted')}</p>
        </div>
      </section>

      {/* EMOTIONAL HOOK */}
      <section className="bg-[#111111] py-28 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[11px] tracking-[0.2em] text-[var(--copper)]">THE PROBLEM</p>
          <p className="font-display italic text-[28px] text-cream/85 leading-[1.5] mt-6">
            &quot;You have 12 tabs open. One for LinkedIn. One for their website. One for ChatGPT. One for Notion notes. Two hours later — a mediocre email you&apos;re not even confident about.&quot;
          </p>
          <p className="mt-10 text-[17px] text-cream-70 leading-[1.7]">
            You&apos;re not the bottleneck. The workflow is.<br />
            MailMind replaces ten tools and ten hours with one command.<br />
            Four agents that think, profile, strategize, and write — simultaneously.<br />
            <span className="text-cream">The result crystallizes in seconds.</span>
          </p>
        </div>
      </section>

      {/* HOW (agents) */}
      <section id="how" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.2em] text-[var(--copper)]">THE INTELLIGENCE STACK</p>
            <h2 className="font-display text-[40px] mt-4">Four minds. One mission.</h2>
            <CopperStreak className="mt-5 max-w-sm mx-auto" />
            <p className="mt-6 text-[16px] text-cream-70">
              Most AI tools give you one brain. We give you four specialists — each one trained for a different dimension of human persuasion — running simultaneously, then converging on a single, calibrated output.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mt-14">
            {AGENTS.map(({ Icon, name, desc }) => (
              <div key={name} className="glass glass-lift p-7">
                <Icon className="text-[var(--copper)]" size={26} />
                <h3 className="font-display text-[22px] mt-4">{name}</h3>
                <p className="text-cream-70 text-[14px] leading-[1.7] mt-2">{desc}</p>
              </div>
            ))}
          </div>

          {/* connector diagram */}
          <div className="mt-16 flex flex-col items-center">
            <svg viewBox="0 0 600 240" className="w-full max-w-2xl">
              {([[80, 60], [520, 60], [80, 200], [520, 200]] as const).map(([x, y], i) => (
                <g key={i}>
                  <line x1={x} y1={y} x2={300} y2={130} stroke="var(--copper)" strokeOpacity="0.3" strokeWidth="1" />
                  <circle cx={x} cy={y} r="22" fill="var(--obsidian-light)" stroke="var(--copper)" strokeWidth="1.5" />
                  <text x={x} y={y + 4} textAnchor="middle" fill="var(--cream)" fontSize="10" fontFamily="Inter">
                    {["R", "P", "S", "C"][i]}
                  </text>
                  <circle r="3" fill="var(--copper)">
                    <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite" path={`M ${x} ${y} L 300 130`} />
                  </circle>
                </g>
              ))}
              <circle cx="300" cy="130" r="36" fill="var(--copper)" />
              <text x="300" y="128" textAnchor="middle" fill="var(--obsidian)" fontSize="11" fontFamily="Playfair Display">✦</text>
              <text x="300" y="142" textAnchor="middle" fill="var(--obsidian)" fontSize="9" fontFamily="Inter">Crystallized</text>
            </svg>
            <p className="text-[13px] text-cream-50 mt-2 italic">When all four agents reach consensus — the email crystallizes.</p>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-20 px-6 bg-[#111111]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { num: "4×", color: "var(--copper)", label: "AI Specialists Working For You", sub: "Researcher · Psychologist · Strategist · Copywriter" },
            { num: "~8s", color: "var(--copper)", label: "From Brief to Crystallized Draft", sub: "Parallel processing beats sequential every time" },
            { num: "94%", color: "var(--consensus-green)", label: "Agent Consensus Rate", sub: "Emails only surface when all agents agree on quality" },
          ].map((m) => (
            <div key={m.label} className="glass glass-lift p-8 text-center">
              <div className="font-display text-[64px] leading-none" style={{ color: m.color }}>{m.num}</div>
              <div className="mt-4 text-cream text-[15px]">{m.label}</div>
              <div className="mt-2 text-[13px] text-cream-40">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OLD VS NEW */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.2em] text-[var(--copper)]">WHY IT MATTERS</p>
            <h2 className="font-display text-[36px] mt-4">You&apos;ve been running an agency alone.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="glass p-8 border-l-4 border-l-[var(--conflict-red)] opacity-80">
              <h3 className="font-display text-[20px] text-cream-70">Before MailMind</h3>
              <ul className="mt-5 space-y-3 text-[14px] text-cream-50">
                {["10+ browser tabs for one prospect", "Manual research taking 45–90 minutes", "Generic templates that feel generic", "No psychology — guessing the tone", "Reviewing and rewriting manually", "One brain doing all the thinking"].map((t) => (
                  <li key={t} className="flex gap-3"><X size={16} className="text-[var(--conflict-red)] shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="glass p-8 border-l-4 border-l-[var(--copper)]">
              <h3 className="font-display text-[20px] text-[var(--copper)]">With MailMind</h3>
              <ul className="mt-5 space-y-3 text-[14px] text-cream">
                {["One command — agents handle everything", "Deep research done in seconds", "Every email tailored to a real human profile", "OCEAN psychology guiding every word choice", "Crystallized output ready for approval", "Four specialists working as one"].map((t) => (
                  <li key={t} className="flex gap-3"><span className="text-[var(--copper)]">✦</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-12 text-center max-w-2xl mx-auto font-display italic text-[22px] text-cream-70 leading-[1.5]">
            &quot;It&apos;s not AI replacing your judgment. It&apos;s AI doing the groundwork so your judgment has something real to work with.&quot;
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 px-6 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.2em] text-[var(--copper)]">PRICING</p>
            <h2 className="font-display text-[40px] mt-4">Choose your intelligence tier.</h2>
            <p className="mt-3 text-cream-50">No lock-in. Cancel anytime. Start writing better emails today.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {[
              { name: "Free", price: "$0", forWho: "Try the engine, no card", featured: false, features: ["3 AI emails / month", "1 active project", "Researcher agent only", "Basic Aurelius chat", "Email Vault (1 document)"], cta: "Start Free →" },
              { name: "Solo", price: "$49", forWho: "Freelancers & solo founders", featured: false, features: ["15 AI-crafted emails/month", "Researcher + Copywriter agents", "Basic prospect profiling", "Email Vault (5 documents)", "Aurelius AI assistant"], cta: "Start Solo →" },
              { name: "Studio", price: "$129", forWho: "Growing teams & serious founders", featured: true, features: ["Unlimited AI emails", "All 4 agents (full parallel)", "OCEAN Digital Twin profiling", "Simulated reaction panel", "Email Vault (50 documents)", "Aurelius with full context"], cta: "Start Studio →" },
              { name: "Agency", price: "$399", forWho: "Agencies & multi-client", featured: false, features: ["Everything in Studio", "5 team seats", "Client workspace separation", "White-label export", "Dedicated support"], cta: "Start Agency →" },
            ].map((p) => (
              <div key={p.name} className={`glass glass-lift p-8 relative ${p.featured ? "border-[var(--copper)] shadow-[0_0_40px_rgba(193,123,63,0.15)]" : ""}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--consensus-green)] text-cream text-[10px] tracking-widest">MOST POPULAR</div>
                )}
                <h3 className="font-display text-[24px]">{p.name}</h3>
                <p className="text-[13px] text-cream-40 mt-1">{p.forWho}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-[44px] text-cream">{p.price}</span>
                  <span className="text-cream-40 text-sm">/mo</span>
                </div>
                <ul className="mt-6 space-y-2 text-[13px] text-cream-70">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check size={14} className="text-[var(--copper)] shrink-0 mt-0.5" />{f}</li>)}
                </ul>
                <Link href={`/${locale}/sign-up`} className={`block text-center mt-7 py-2.5 rounded-md text-sm font-medium ${p.featured ? "copper-shimmer bg-[var(--copper)] text-[var(--obsidian)]" : "border border-[var(--copper)] text-cream hover:bg-[rgba(193,123,63,0.08)]"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-cream-50 text-sm">
            Not sure which plan? <a href="#" className="text-[var(--copper)]">Talk to Aurelius →</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="bg-[#080808] pt-16 pb-8 px-6">
        <CopperStreak className="max-w-6xl mx-auto mb-12" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-[20px] text-[var(--copper)] flex items-center gap-2"><Iris size={22} /> MAILMIND</div>
            <p className="mt-4 text-[13px] text-cream-50">Built by Bogdan. For founders who take outreach seriously.</p>
          </div>
          <div>
            <p className="text-[12px] uppercase text-cream-40 tracking-widest">Product</p>
            <ul className="mt-4 space-y-2 text-[13px] text-cream-70">
              <li><a href="#how">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><Link href={`/${locale}/dashboard`}>War Room</Link></li>
              <li>Aurelius</li>
              <li>Changelog</li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] uppercase text-cream-40 tracking-widest">About Me</p>
            <p className="mt-4 text-[13px] text-cream-50 leading-relaxed">
              {t('footer.about_description')}
            </p>
            <a href="#" className="text-[var(--copper)] text-[13px] mt-3 inline-block">Read the full story →</a>
          </div>
          <div>
            <p className="text-[12px] uppercase text-cream-40 tracking-widest">Stay in the loop</p>
            <p className="mt-3 text-[13px] text-cream-40">No noise. Just meaningful updates on MailMind.</p>
            <div className="mt-3 flex gap-2">
              <input placeholder="you@company.com" className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-[rgba(193,123,63,0.2)] text-sm text-cream outline-none focus:border-[var(--copper)]" />
              <button className="px-4 py-2 bg-[var(--copper)] text-[var(--obsidian)] rounded-md text-sm font-medium">Subscribe</button>
            </div>
            <p className="mt-3 text-[12px] text-cream-40">Or email me directly: <a className="text-[var(--copper)]">bogdan@mailmind.app</a></p>
          </div>
        </div>
        <CopperStreak className="max-w-6xl mx-auto mt-12 mb-4" />
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between text-[12px] text-cream-25">
          <span>© 2026 MailMind. All rights reserved.</span>
          <span>Privacy Policy · Terms</span>
        </div>
      </footer>
    </div>
  );
}