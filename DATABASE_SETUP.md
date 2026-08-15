# Wedding Flipbook - Database Setup Guide

## Phase 2: Database Architecture

This document describes the database schema, security policies, and setup instructions for the Wedding Flipbook application.

## Schema Overview

### Tables

#### profiles
- Linked to Supabase Auth
- Stores user role (admin/customer) and basic info
- One profile per auth user
- PK: `id` (UUID)
- FK: `auth_user_id` (Supabase Auth)

#### customers
- Wedding couples/clients
- Created by admins
- One customer per auth user
- PK: `id` (UUID)
- FK: `profile_id` → profiles

#### albums
- Wedding albums belonging to customers
- Can be unpublished (under construction)
- Published albums are visible to customers
- PK: `id` (UUID)
- FK: `customer_id` → customers

#### photos
- Individual photos in albums
- Ordered within album
- Optional captions
- PK: `id` (UUID)
- FK: `album_id` → albums

#### album_music
- Background music for albums
- One music per album (unique constraint)
- Can be toggled active/inactive
- PK: `id` (UUID)
- FK: `album_id` → albums

#### audit_logs
- Tracks all admin actions
- Used for compliance and debugging
- PK: `id` (UUID)
- FK: `user_id` → profiles

## Security (RLS Policies)

### Admins
- Can read/write all tables
- Can create customers
- Can manage albums, photos, music
- Can view audit logs

### Customers
- Can read their own profile
- Can read their own customer record
- Can read their own PUBLISHED albums only
- Can read photos from their published albums
- Can read music from their published albums
- Cannot insert/update/delete ANY data
- Cannot access other customers' data

### Policy Strategy

Each policy uses a subquery to verify the user's role:

```sql
EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.auth_user_id = auth.uid()
  AND p.role = 'admin'
)
```

This approach:
- Is immune to role manipulation
- Works across table joins
- Is database-level enforcement (not UI-level)

## Setup Instructions

### 1. Create Supabase Project

Go to https://supabase.com and create a new project in your organization.

Note:
- Project URL: will be your `NEXT_PUBLIC_SUPABASE_URL`
- Anon Key: will be your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Apply Migrations

You can apply migrations in two ways:

#### Option A: Supabase Dashboard SQL Editor (Manual)

1. Open your Supabase project
2. Go to SQL Editor
3. Create a new query
4. Copy contents of `supabase/migrations/001_initial_schema.sql`
5. Run the query
6. Repeat for `002_rls_policies.sql`
7. Repeat for `003_storage_policies.sql`

#### Option B: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project (will prompt for password)
supabase link --project-id YOUR_PROJECT_ID

# Apply migrations
supabase db push

# Create functions/triggers (future)
# supabase functions deploy
```

### 3. Create Storage Buckets

In Supabase dashboard:

1. Go to Storage
2. Create bucket `wedding-photos`
   - Privacy: Private (RLS enabled)
3. Create bucket `wedding-music`
   - Privacy: Private (RLS enabled)

### 4. Apply Storage Policies

The SQL in `003_storage_policies.sql` applies Supabase Storage policies.

**Note**: Storage policies use similar RLS structure to table policies but operate on `storage.objects`.

### 5. Create Admin Account

For development/production setup:

```sql
-- This must be done via Supabase Auth or your admin signup flow
-- Never create auth users directly with SQL

-- Step 1: Create user via Supabase Auth UI
-- - Email: admin@yourcompany.com
-- - Password: (secure temporary password)

-- Step 2: Get the auth user ID (UUID) from Supabase Auth

-- Step 3: Run this SQL to create profile with admin role:
INSERT INTO profiles (auth_user_id, role, email, full_name)
VALUES (
  'YOUR_AUTH_USER_UUID_HERE',
  'admin',
  'admin@yourcompany.com',
  'Admin User'
);
```

### 6. Test Security

Critical test: **Customer cannot access another customer's data**

```sql
-- Setup
INSERT INTO profiles (auth_user_id, role, email) VALUES 
  ('CUSTOMER_A_AUTH_ID', 'customer', 'customer_a@example.com'),
  ('CUSTOMER_B_AUTH_ID', 'customer', 'customer_b@example.com');

INSERT INTO customers (profile_id, full_name, email, status) VALUES
  ('CUSTOMER_A_PROFILE_ID', 'Couple A', 'couple_a@example.com', 'active'),
  ('CUSTOMER_B_PROFILE_ID', 'Couple B', 'couple_b@example.com', 'active');

INSERT INTO albums (customer_id, bride_name, groom_name, wedding_date, is_published) VALUES
  ('CUSTOMER_A_ID', 'Bride A', 'Groom A', '2026-06-01', true),
  ('CUSTOMER_B_ID', 'Bride B', 'Groom B', '2026-07-01', true);

-- Test: Connect as CUSTOMER_A
-- SELECT * FROM albums;
-- Should return only ALBUM_A (because is_published=true for their album)
-- Should NOT return ALBUM_B

-- Test: Try to query ALBUM_B_ID directly
-- SELECT * FROM albums WHERE id = 'ALBUM_B_ID';
-- Should return 0 rows due to RLS policy
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Server-only (never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

## Database Connections

The app uses:

1. **@supabase/supabase-js** for client-side queries
   - Uses anon key (limited permissions via RLS)
   - Safe to expose in browser

2. **Server functions** for administrative operations
   - Use service role key (has all permissions)
   - Never expose to browser
   - Validate all inputs and authorization

Example:

```typescript
// Client-side: anon key, RLS enforced
const { data } = await supabase
  .from('albums')
  .select('*')
  .eq('is_published', true);

// Server-side: service role, must validate manually
const { data } = await supabaseAdmin
  .from('albums')
  .select('*')
  .eq('customer_id', customerId);
  // Must verify current user can access this customerId!
```

## Performance Considerations

### Indexes
All foreign keys and common filters have indexes.

Check with:
```sql
SELECT * FROM pg_indexes WHERE tablename IN (
  'profiles', 'customers', 'albums', 'photos', 'album_music', 'audit_logs'
);
```

### Query Patterns

**Load customer's published album with all photos:**
```sql
SELECT 
  a.*,
  json_agg(p.* ORDER BY p.sort_order) as photos,
  am.* as music
FROM albums a
LEFT JOIN photos p ON a.id = p.album_id
LEFT JOIN album_music am ON a.id = am.album_id
WHERE a.id = $1 AND a.is_published = true
GROUP BY a.id, am.id;
```

**List all customers for admin:**
```sql
SELECT c.*, p.role
FROM customers c
JOIN profiles p ON c.profile_id = p.id
WHERE c.status = 'active'
ORDER BY c.created_at DESC
LIMIT 50 OFFSET $1;
```

## Backups

Supabase provides:
- Automatic daily backups
- Point-in-time recovery
- Manual backup option before major changes

For production, configure automated backups in Supabase settings.

## Next Phase

Once migrations are applied and storage configured:

→ PHASE 3: Authentication (login, logout, password reset)
