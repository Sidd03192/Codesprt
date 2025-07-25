import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  console.log("🔍 Callback received:");
  console.log("- Code:", !!code);
  console.log("- Error:", error);
  console.log("- Error Description:", errorDescription);

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`);
  }

  // Handle PKCE flow (code-based)
  if (code) {
    const supabase = await createClient();
    
    try {
      console.log("🔄 Exchanging code for session...");
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`);
      }

      if (data.session && data.user) {
        console.log("✅ Successfully exchanged code for session for user:", data.user.id);
        
        // Get or create user profile and determine role
        const role = await getOrCreateUserProfile(supabase, data.user);
        const redirectPath = role === 'teacher' ? '/dashboard' : '/student-dashboard';

        console.log("🚀 Redirecting to:", redirectPath);
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`);
    }
  }

  // If no code and no error, this might be an implicit flow redirect
  // Redirect to a client-side handler
  console.log("🔄 No code found, redirecting to client-side handler");
  return NextResponse.redirect(`${origin}/auth/callback-client`);
}

// Helper function to get or create user profile
async function getOrCreateUserProfile(supabase, user) {
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log("Found existing profile with role:", existingProfile.role);
      return existingProfile.role;
    }

    // If profile doesn't exist (new OAuth user), create one with default role
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log("Creating new profile for OAuth user");
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            role: 'student', // Default role for OAuth users
          },
        ])
        .select('role')
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return 'student'; // Default fallback
      }

      console.log("Created new profile with role:", newProfile.role);
      return newProfile.role;
    }

    console.error('Error fetching user profile:', fetchError);
    return 'student'; // Default fallback
  } catch (err) {
    console.error('Unexpected error in getOrCreateUserProfile:', err);
    return 'student'; // Default fallback
  }
}