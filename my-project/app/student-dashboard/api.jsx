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
  isSubmitting
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
  if (isSubmitting) {
    date = new Date().toISOString(); // Get the current date and time in ISO format
    console.log("Submitting assignment at:", date);
  }

  const { error } = await supabase
    .from("assignment_students")
    .update({ submitted_code: student_code, submitted_at: date })
    .eq("student_id", student_id)
    .eq("assignment_id", numericAssignmentId);
  if (error) {
    console.error("Error saving assignment data:", error.message);
    return;
  } else {
    return "success";
  }
};
