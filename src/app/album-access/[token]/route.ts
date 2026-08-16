import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

interface Params {
  token: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { token } = await params;
  const loginUrl = new URL('/auth/login', request.url);

  const adminClient = createAdminClient();

  const { data: accessToken } = await adminClient
    .from('album_access_tokens')
    .select('album_id, revoked_at')
    .eq('token', token)
    .single();

  if (!accessToken || accessToken.revoked_at) {
    return NextResponse.redirect(loginUrl);
  }

  const { data: album } = await adminClient
    .from('albums')
    .select('customer_id, is_published')
    .eq('id', accessToken.album_id)
    .single();

  if (!album || !album.is_published) {
    return NextResponse.redirect(loginUrl);
  }

  const { data: customer } = await adminClient
    .from('customers')
    .select('profile_id')
    .eq('id', album.customer_id)
    .single();

  if (!customer) {
    return NextResponse.redirect(loginUrl);
  }

  const { data: customerProfile } = await adminClient
    .from('profiles')
    .select('email')
    .eq('id', customer.profile_id)
    .single();

  if (!customerProfile) {
    return NextResponse.redirect(loginUrl);
  }

  // Mint a fresh one-time OTP behind the scenes on every scan, so the QR code itself
  // never contains a usable credential and can be scanned repeatedly.
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: customerProfile.email,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(`/customer/album/${accessToken.album_id}`, request.url));
}

