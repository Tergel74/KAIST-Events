import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateKaistEmail } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';
  const isSignup = requestUrl.searchParams.get('signup') === 'true';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_failed`);
    }

    if (data.user?.email && !validateKaistEmail(data.user.email)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=invalid_email`);
    }

    if (data.user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        // User doesn't exist in our database - this shouldn't happen with the new flow
        // but handle it gracefully by redirecting to signup
        await supabase.auth.signOut();
        return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=account_not_found`);
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${redirect}`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=no_code`);
}
