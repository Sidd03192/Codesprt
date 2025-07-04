// file: app/actions.ts

"use server";
import { createClient } from "../../utils/supabase/server";
import { executeCode } from "../components/editor/api";
// This action fetches assignments for a given student.
// It returns both the assignments that are already active
// and the single next assignment that is scheduled to start.
export async function getAssignmentsData(student_id) {
  // const user = await supabase.auth.getUser(); // extra security.
  // if (user.error) {
  //   console.error("Error fetching user:", user.error);
  //   return { error: "Could not fetch user." };
  // }
  const supabase = await createClient();
  // 1. Get all assignments that are already visible (this is safe to send)
  const { data: visibleAssignments, error: visibleError } = await supabase
    .from("assignment_students")
    .select("*")
    .eq("student_id", student_id)
    .lte("start_date", "now()")
    .order("start_date", { ascending: false });

  console.log("Visisble assignments:", visibleAssignments);
  if (visibleError) {
    console.error("Error fetching visible assignments:", visibleError);
    return { error: "Could not fetch visible assignments." };
  }

  // 2. Get ONLY THE TIME of the single next upcoming event
  const { data: nextEvent, error: nextEventError } = await supabase
    .from("assignment_students")
    .select("start_date") // <-- We ONLY select the start_date
    .eq("student_id", student_id)
    .gt("start_date", "now()")
    .order("start_date", { ascending: true });

  console.log("Next event:", nextEvent);

  // It's normal for nextEvent to be null if there are no more assignments.
  // We don't need to treat "no rows" as a hard error here.

  // 3. Return the visible assignments and JUST the next start time string
  return {
    visibleAssignments,
    nextStartTime: nextEvent?.start_date || null, // Send the string or null
  };
}
export const getAssignmentDetails = async (assignment_id) => {
  const supabase = await createClient();
  console.log("Fetching assignment details:", assignment_id);
  if (!assignment_id) {
    console.error("No assignment ID provided, got null or undefined.");
    return;
  }
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, title, description, language, code_template, hints, open_at, due_at, status,  locked_lines, hidden_lines, allow_late_submission, allow_copy_paste, allow_auto_complete, auto_grade, show_results"
    )
    .eq("id", assignment_id)
    .single(); // Use .single() to get a single object instead of an array
  if (error) {
    console.error("Error fetching assignments:", error.message);
    return;
  } else {
    console.log("Assignment details:", data);
    return data;
  }
};

export const joinClassroom = async (joinCode, userId) => {
  console.log("hello");
  const supabase = await createClient();
  console.log("User ID:", userId);
  const { data: classes, error: fetchError } = await supabase
    .from("classes")
    .select("*")
    .eq("join_id", joinCode)
    .limit(1);

  if (fetchError || classes.length === 0) {
    console.error("Invalid join code or DB error:", fetchError?.message);
    return null;
  }

  const course = classes[0];
  const { data: existingJoin } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", userId)
    .eq("class_id", course.id)
    .maybeSingle();

  if (existingJoin) {
    console.log("User already joined this course");
    return null; // check if this makes sense
  }
  /*const { data: emailData, error: emailError } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (emailError) {
    console.error("Error fetching email:", emailError.message);
    return null;
  }
  const email = emailData.email;*/

  const { error: insertError } = await supabase.from("enrollments").insert({
    student_id: userId,
    enrolled_at: new Date(),
    class_id: course.id,
    full_name: "john doe",
    email: "johndoe@gmail.com",
  });

  if (insertError) {
    console.error("Error joining course:", insertError.message);
    return null;
  }
  return course;
};

export const getUserCourses = async (userId) => {
  const supabase = await createClient();
  console.log("userId: ", userId);
  const { data, error } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", userId);
  if (error) {
    console.error("Error fetching user courses:", error.message);
    return null;
  }
  if (data.length === 0) {
    return [];
  }
  const course_ids = data.map((entry) => entry.class_id);
  const { data: courses, error: coursesError } = await supabase
    .from("classes")
    .select("*")
    .in("id", course_ids);

  if (coursesError) {
    console.error("Error fetching courses:", coursesError.message);
    return null;
  }

  return courses;
};

// check for safety purposes
export const gradeAssignment = async ({
  assignment_data,
  language,
  testcases,
}) => {
  const supabase = await createClient();
  const userCode = assignment_data.submitted_code;

  // Helper: Wraps code with test cases
  const wrapCodeWithTests = (userCode, testCases) => {
    const testCode = testCases
      .map(({ methodName, input, expectedOutput, name }) => {
        return `
try {
  const result = ${methodName}(${input});
  if (String(result) !== String(${JSON.stringify(expectedOutput)})) {
    console.log("❌ ${name} failed. Expected: ${expectedOutput}, Got: " + result);
  } else {
    console.log("✅ ${name} passed.");
  }
} catch (e) {
  console.log("❌ ${name} errored: " + e.message);
}
        `.trim();
      })
      .join("\n\n");

    return `${userCode}\n\n${testCode}`;
  };

  const codeToExecute = wrapCodeWithTests(userCode, testcases);

  const result = await executeCode(language, codeToExecute);

  // Optional: You can also parse and score results here
  console.log("Final Output:\n", result.run.stdout);

  return result.run; // or process to extract score
};

export const saveAssignment = async (
  student_code,
  student_id,
  assignment_id,
  isSubmitting,
  submitted_at
) => {
  const supabase = await createClient();

  console.log(
    "Saving assignment data for student:",
    student_id,
    "assignment:",
    assignment_id,
    "code:",
    student_code
  );
  const numericAssignmentId = parseInt(assignment_id, 10);

  if (!student_code || !student_id || !numericAssignmentId) {
    console.error("Missing required parameters for saving assignment data.");
    return;
  }
  let date = null;

  let satus = isSubmitting ? "submitted" : "draft";
  if (isSubmitting) {
    date = submitted_at; // Get the current date and time in ISO format
    console.log("Submitting assignment at:", date);
  }

  const { error } = await supabase
    .from("assignment_students")
    .update({ submitted_code: student_code, submitted_at: date, satus: satus })
    .eq("student_id", student_id)
    .eq("assignment_id", numericAssignmentId);
  if (error) {
    console.error("Error saving assignment data:", error.message);
    return;
  } else {
    return "success";
  }
};
