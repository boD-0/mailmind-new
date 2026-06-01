# MailMind — Growth & Business Roadmap

> **Prioritizare:** 🔴 Impact ridicat + efort mic → fă primul | 🟠 Impact ridicat + efort mare → planifică | 🟢 Nice to have → după lansare

---

## 01 — Pricing & Monetizare

| # | Idee | Status | Categorie |
|---|---|---|---|
| 1.1 | **Definește prețuri concrete acum** — FREE (3 swarm/lună), STARTER $49/lună (30 execuții), PROFESSIONAL $149/lună (unlimited + War Room + API). Bazat pe competitori: Lemlist ~$59, Apollo ~$49. | ✅ DONE | REVENUE |
| 1.2 | **Usage-based pricing ca add-on** — "Swarm credits" extra: $5 pentru 10 execuții suplimentare. Fără să urce tier. Crește ARPU fără frecare. | ✅ DONE | REVENUE |
| 1.3 | **Trial 14 zile PROFESSIONAL fără card** — Activare automată la signup. Ziua 10: reminder email. Ziua 14: downgrade automat la FREE. Zero fricțiune. | ✅ DONE | REVENUE · CONVERSIE |
| 1.4 | **Tier Agency / Team cu seat-uri** — $299/lună pentru 5 seat-uri + workspace partajat + billing centralizat. După lansare, când ai primii clienți enterprise. | ❌ NOT DONE | REVENUE |
| 1.5 | **API public cu pricing per token** — Expune swarm-ul ca API: $0.10 per execuție. Canal nou de vânzare B2B fără sales effort. Documentație + rate limiting + dashboard. | ❌ NOT DONE | REVENUE · DIFERENȚIATOR |
| 1.6 | **Affiliate program** — 30% comision recurent 12 luni. Target: creatori B2B, consultanți sales, influenceri LinkedIn. Polar.sh sau Rewardful. | ❌ NOT DONE | REVENUE |

---

## 02 — Growth & Achiziție Clienți

| # | Idee | Status | Categorie |
|---|---|---|---|
| 2.1 | **Waitlist cu acces early bird** — Lansează o pagină de waitlist ACUM. Promisiune: 3 luni STARTER gratuit pentru primii 100. Validezi cererea. Tally.so sau formă cu Resend. | ✅ DONE | GROWTH |
| 2.2 | **Product Hunt launch pregătit** — Demo video 60s, screenshots, tagline, 50+ hunters. Poate aduce 500-2000 useri/zi. Planifică cu 4 săptămâni înainte. | ✅ DONE | GROWTH |
| 2.3 | **Demo video interactiv pe landing page** — 90 secunde: swarm complet de la input la email. Loom sau Screen Studio. Crește conversia 2-3x. | ❌ NOT DONE | CONVERSIE |
| 2.4 | **Integrare nativă Gmail / Google Workspace** — Chrome extension sau OAuth Gmail: trimite emailul direct din MailMind fără copy-paste. Gmail API (OAuth scope: send). | ✅ DONE | DIFERENȚIATOR |
| 2.5 | **Integrare LinkedIn Sales Navigator** — Import automat prospect data: nume, titlu, companie, postări recente. Proxycurl API pentru scraping etic. | ✅ DONE | DIFERENȚIATOR |
| 2.6 | **Integrare HubSpot / Salesforce CRM** — Sync bidirecțional: import contacte, trimite emailuri înapoi ca activitate. OAuth + webhook. Use case enterprise. | ❌ NOT DONE | DIFERENȚIATOR |
| 2.7 | **Marketplace de template-uri OCEAN** — Userii publică template-uri de strategie per profil OCEAN. Network effect + conținut generat de comunitate. | ❌ NOT DONE | DIFERENȚIATOR |

---

## 03 — Features de Produs care Lipsesc

| # | Idee | Status | Categorie |
|---|---|---|---|
| 3.1 | **Email tracking — open rate + click rate** — Pixel invizibil + link wrapping. Dashboard: rată deschidere, click-uri, reply detection. Resend webhooks. | ✅ DONE | VALOARE |
| 3.2 | **Bulk prospect upload (CSV import)** — 100 prospecți → 100 emailuri personalizate în batch. OCEAN per prospect. Async cu notificări. Vinde PROFESSIONAL. | ✅ DONE | VALOARE |
| 3.3 | **Prospect database internă cu istoric** — Salvează profil OCEAN + emailuri + dată contactare. Refolosește la swarm-uri viitoare. Crește calitatea în timp. | ✅ DONE | RETENTION |
| 3.4 | **Scheduling inteligent de trimitere** — Recomandă ora optimă: fus orar + industrie + date istorice. Integrare Resend scheduled sending. | ❌ NOT DONE | VALOARE |
| 3.5 | **Follow-up sequence automată bazată pe răspuns** — Fără răspuns în X zile: follow-up calibrat diferit. Răspuns pozitiv: reply propus. Răspuns negativ: închide. | ❌ NOT DONE | DIFERENȚIATOR |
| 3.6 | **Dashboard analytics per campanie** — Recharts: reply rate, scor OCEAN mediu, performanță pe tone, cel mai bun agent. Insights = retenție. | ✅ DONE | RETENTION |
| 3.7 | **AI coaching — Aurelius analizează ce a funcționat** — "Subject line sub 7 cuvinte = 40% open rate mai mare la prospecții tăi". Personalizat per user. | ✅ DONE | DIFERENȚIATOR |
| 3.8 | **Mobile app (iOS/Android) pentru aprobare rapidă** — Notificare push + preview email + aprobare/respingere cu un tap. React Native / Expo. | ❌ NOT DONE | UX |

---

## 04 — Infrastructure & DevOps

| # | Idee | Status | Categorie |
|---|---|---|---|
| 4.1 | **Pagină de status publică (status.mailmind.app)** — BetterStack sau Instatus. Uptime: API, War Room, AI Swarm, Database. 30 minute setup, credibilitate masivă. | ❌ NOT DONE | TRUST |
| 4.2 | **CI/CD pipeline complet pe GitHub Actions** — PR: TS check + ESLint + npm audit. Merge în main: deploy Vercel + migrări Drizzle automat. Rollback + notificare Discord. | ✅ DONE | DEVOPS |
| 4.3 | **Queue sistem pentru swarm executions (Inngest)** — Swarm-urile durează 30-120s → nu pot rula sincron (timeout Vercel 60s). Inngest: serverless, retry automat, priority queue per tier. | ✅ DONE | SCALABILITATE |
| 4.4 | **Preview environments pe fiecare PR** — Vercel automat + DB de test + Redis de test. URL unic per PR. Esențial cu beta useri. | ❌ NOT DONE | DEVOPS |
| 4.5 | **Cost monitoring OpenAI automat** — Cron job zilnic: agregă token usage, calculează cost per user/tier, compară cu revenue. Alert dacă user costă > plătește. | ✅ DONE | COSTURI |
| 4.6 | **Multi-region deployment** — Vercel Edge + Neon multi-region (EU + US). Pentru useri globali. Proiectează fără date regionale hardcodate. | ❌ NOT DONE | SCALABILITATE |

---

## 05 — UX, Trust & Retenție

| # | Idee | Status | Categorie |
|---|---|---|---|
| 5.1 | **PostHog funneluri de conversie definite** — Funnel 1: Signup → Onboarding → Primul swarm → Upgrade. Funnel 2: Trial → War Room → Upgrade. 30 minute setup. | ✅ DONE | ANALYTICS |
| 5.2 | **In-app feedback widget (Canny sau custom)** — Buton "Give feedback" în sidebar: rating 1-5 + text. Date în Canny sau DB. Beta useri = cea mai valoroasă resursă. | ✅ DONE | UX |
| 5.3 | **Changelog public vizibil în aplicație** — Pagină /changelog + indicator "NEW" în sidebar. Headway.app sau MDX. Arată că produsul e viu. | ✅ DONE | UX |
| 5.4 | **Onboarding checklist gamificat cu progress** — "Complete profile" → "Upload document" → "First swarm" → "Review Twin". Unlock feature la completare. Reduce time-to-value. | ✅ DONE | UX |
| 5.5 | **SOC 2 / GDPR trust page** — Pagină /security: ce date colectezi, unde-s stocate, subprocesori, retenție, ștergere date. Enterprise clients cer asta. | ✅ DONE | TRUST |
| 5.6 | **Testimoniale și case studies reale** — 5-10 useri gratuit în schimbul testimonial + date rezultate ("reply rate 3% → 11%"). Cifre reale > orice feature. | ✅ DONE | CONVERSIE |

---

## 06 — Poziționare Competitivă

| # | Idee | Status | Categorie |
|---|---|---|---|
| 6.1 | **Pagină de comparație vs Lemlist / Apollo / Clay** — "MailMind vs Lemlist" etc. De ce OCEAN + multi-agent > template-uri statice. Rankează bine SEO. | ✅ DONE | SEO · DIFERENȚIATOR |
| 6.2 | **Poziționare: "primul email marketing cu Digital Twin"** — Digital Twin + OCEAN = diferențiatorul real. Toată comunicarea bate pe asta, nu pe "AI-powered". | ❌ NOT DONE | DIFERENȚIATOR |
| 6.3 | **Blog / content marketing SEO pe psihologie B2B** — "Ce e profilul OCEAN", "De ce emailurile personalizate psihologic funcționează", studiu cold email vs calibrat. | ✅ DONE | SEO |
| 6.4 | **Cercetare competitivă formalizată** — Documentează Clay, Lemlist, Apollo, Instantly: preț, features, ICP. MailMind = calitate psihologică > volum. | ❌ NOT DONE | STRATEGIE |

---

## Rezumat per Categorie

| Categorie | Completed | Remaining |
|---|---|---|
| REVENUE | 1.1 Prețuri concrete, 1.2 Usage-based, 1.3 Trial 14 zile | 1.4 Agency tier, 1.5 API public, 1.6 Affiliate |
| GROWTH | 2.1 Waitlist, 2.2 Product Hunt | — |
| CONVERSIE | 1.3 Trial, 5.6 Testimoniale | 2.3 Demo video |
| DIFERENȚIATOR | 2.4 Gmail, 2.5 LinkedIn, 3.7 AI coaching, 6.1 Comparație | 1.5 API, 2.6 CRM, 2.7 Marketplace, 3.5 Follow-up, 6.2 Poziționare |
| VALOARE | 3.1 Email tracking, 3.2 Bulk CSV | 3.4 Scheduling |
| RETENTION | 3.3 Prospect DB, 3.6 Analytics dashboard | — |
| UX | 5.2 Feedback widget, 5.3 Changelog, 5.4 Onboarding gamificat | 3.8 Mobile app |
| TRUST | 5.5 SOC 2 / GDPR | 4.1 Status page |
| DEVOPS | 4.2 CI/CD | 4.4 Preview envs |
| SCALABILITATE | 4.3 Queue system | 4.6 Multi-region |
| COSTURI | 4.5 Cost monitoring | — |
| ANALYTICS | 5.1 PostHog funneluri | — |
| SEO | 6.1 Comparație, 6.3 Blog | — |
| STRATEGIE | — | 6.4 Cercetare competitivă |

---

## 📊 Statistici Finale

- **✅ DONE:** 23 din 37 task-uri (62%)
- **❌ NOT DONE:** 14 task-uri rămase
- **By priority:** Toate 🔴 urgente sunt DONE. 14 rămase sunt 🟢 (nice-to-have) sau 🟠 (efort mare)

---


