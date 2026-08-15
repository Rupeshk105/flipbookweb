# Wedding Flipbook

Wedding Flipbook is a private multi-tenant digital wedding album built with Next.js and Supabase.

## Local development

Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable/anon key. Keep `.env.local` private.

```bash
npm install
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

Routes:

- `/` - public Wedding Flipbook homepage
- `/auth/login` - customer login
- `/admin/login` - admin login
- `/customer/dashboard` - published customer albums
- `/admin/dashboard` - album administration

## Supabase setup

Apply the SQL files in `supabase/migrations` in numeric order. Create these private Storage buckets:

- `wedding-photos`
- `wedding-music`

Apply the storage policies after the buckets exist. Create Auth users and matching `profiles` rows before testing login. Customer accounts also require a matching `customers` row.

## Validation

```bash
npm run lint
npm run build
```

## Deployment

Deploy with [Vercel](https://vercel.com) or another Node.js host. Configure the variables from `.env.example` in the host environment and set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin. Add that origin plus `/auth/reset-password` to Supabase Authentication URL Configuration.

Keep service-role credentials server-only and never commit `.env.local`.
