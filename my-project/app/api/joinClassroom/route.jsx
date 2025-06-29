import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);
export async function POST(req) {
  const { joinCode } = await req.json();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: classes, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("join_id", joinCode)
    .limit(1);

  if (classError || !classes?.length) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 400 });
  }

  const course = classes[0];

  const { data: existingJoin } = await supabase
    .from("course_users")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existingJoin) {
    return NextResponse.json({ course }); // already joined
  }

  const { error: insertError } = await supabase
    .from("course_users")
    .insert({
      user_id: userId,
      course_id: course.id,
      joined_at: new Date(),
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ course }); // success response
}
