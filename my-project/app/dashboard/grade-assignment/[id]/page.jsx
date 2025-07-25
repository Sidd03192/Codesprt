import React from "react";
import { CodingInterface } from "../../../components/student-workspace";
import { createClient } from "../../../../utils/supabase/server";

export default async function AssignmentPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Get the USER object, not the session object.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("1. User object:", user);

  // 2. Check if a user exists.
  if (!user) {
    return <div>Please log in to view this assignment.</div>;
  }

  const { data: assignmentData, error } = await supabase
    .from("assignments")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching assignment data:", error);
    return <div>Error loading assignment data.</div>;
  }

  // 3. Use user.id for the permission check.
  if (assignmentData.teacher_id !== user.id) {
    return <div>You do not have permission to view this assignment.</div>;
  }

  return (
    <CodingInterface
      role="teacher"
      session={user} // Pass the user object to your component
      id={id}
      data={assignmentData}
    />
  );
}
