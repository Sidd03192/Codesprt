import React from "react";
import { CodingInterface } from "../../../components/student-workspace";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export default async function AssignmentPage({ params }) {
  const { id } = await params;

  // Debug: Check what cookies we have
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log(
    "🍪 Available cookies:",
    allCookies.map((c) => c.name)
  );

  // Check for Supabase auth cookies specifically
  const authCookies = allCookies.filter((c) => c.name.includes("supabase"));
  console.log("🔐 Supabase auth cookies:", authCookies.length);

  const supabase = await createClient();

  console.log("🔍 Debug: Starting auth check...");

  // Check both session and user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("🔍 Session:", !!session, session?.user?.id);
  console.log("🔍 Session Error:", sessionError);
  console.log("🔍 User:", !!user, user?.id);
  console.log("🔍 User Error:", userError);

  // Check if we have either session or user
  if (!user && !session?.user) {
    console.log("❌ No authentication found");
    return (
      <div className="p-4">
        <h1>Authentication Required</h1>
        <p>Please log in to view this assignment.</p>
        <p>Debug: Found {authCookies.length} Supabase cookies</p>
        <details>
          <summary>Cookie Debug</summary>
          <pre>{JSON.stringify(authCookies, null, 2)}</pre>
        </details>
      </div>
    );
  }

  const authenticatedUser = user || session?.user;
  console.log("✅ Authenticated user:", authenticatedUser.id);

  const { data: assignmentData, error } = await supabase
    .from("assignments")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching assignment data:", error);
    return <div>Error loading assignment data.</div>;
  }

  // Use the authenticated user's ID for the permission check
  if (assignmentData.teacher_id !== authenticatedUser.id) {
    return <div>You do not have permission to view this assignment.</div>;
  }

  return (
    <CodingInterface
      role="teacher"
      session={authenticatedUser}
      id={id}
      data={assignmentData}
    />
  );
}
