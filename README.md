# EcoMarket — Eco-Friendly Products Platform

Платформа для осознанных покупок.

## Tech Stack
- Next.js 15, TypeScript, Prisma, NextAuth v5, Stripe, Tailwind CSS

## Run
1. `npm install`
2. Fill `.env` with DATABASE_URL, NEXTAUTH_SECRET, Stripe keys
3. `npx prisma migrate dev --name init`
4. `npm run dev`

## Deploy to Vercel
Push to GitHub → Import on vercel.com → Set env vars
