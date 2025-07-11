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
      "id, title, description, language, code_template, hints, open_at, due_at, status, locked_lines, hidden_lines, allow_late_submission, allow_copy_paste, allow_auto_complete, auto_grade, show_results, testing_url "
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
  userCode,
  language,
  testcases = [],
}) => {
  // --- Internal helper to wrap the user's code with test cases ---
  const wrapCodeWithTests = (code, tests) => {
    const testCode = tests
      .map(({ methodName, input, expectedOutput, name }) => {
        const expectedOutputString = JSON.stringify(expectedOutput);
        return `
            try {
              const result = ${methodName}(${input});
              if (String(result) !== String(${expectedOutputString})) {
                console.log("❌ ${name} failed. Expected: ${expectedOutput}, Got: " + result);
              } else {
                console.log("✅ ${name} passed.");
              }
            } catch (e) {
              console.log("❌ ${name} errored: " + e.message);
            }`.trim();
      })
      .join("\n\n");
    return `${code}\n\n${testCode}`;
  };

  const codeToExecute = wrapCodeWithTests(userCode, testcases);

  const executionResult = await executeCode(language, codeToExecute);

  // parsing logic stuff
  const stdout = executionResult?.run?.stdout || "";
  const stderr = executionResult?.run?.stderr || "";
  const exitCode = executionResult?.run?.exitCode || 0;

  let testsPassed = 0;
  const testResults = [];

  if (testcases.length > 0) {
    const outputLines = stdout.split("\n");
    testcases.forEach((tc) => {
      const resultLine = outputLines.find((line) => line.includes(tc.name));
      let status = "unknown";
      let actualOutput = "";
      let errorMessage = "";

      if (resultLine) {
        if (resultLine.startsWith("✅")) {
          status = "passed";
          testsPassed++;
        } else if (resultLine.startsWith("❌")) {
          const matchErrored = resultLine.match(/errored: (.*)/);
          if (matchErrored) {
            status = "errored";
            errorMessage = matchErrored[1].trim();
          } else {
            status = "failed";
            const matchGot = resultLine.match(/Got: (.*)/);
            if (matchGot) actualOutput = matchGot[1].trim();
          }
        }
      } else {
        status = "missing_output";
      }

      testResults.push({
        name: tc.name,
        status: status,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualOutput,
        errorMessage: errorMessage,
      });
    });
  }

  const overallScore =
    testcases.length > 0 ? (testsPassed / testcases.length) * 100 : 0;

  const structuredOutput = {
    overallScore: parseFloat(overallScore.toFixed(2)),
    testsPassed: testsPassed,
    totalTests: testcases.length,
    rawStdout: stdout,
    rawStderr: stderr,
    exitCode: exitCode,
    testResults: testResults,
    gradedAt: new Date().toISOString(),
  };

  console.log(
    "Structured Grading Output:\n",
    JSON.stringify(structuredOutput, null, 2)
  );
  return structuredOutput;
};

export const saveAssignment = async (
  student_code,
  student_id,
  assignment_id,
  isSubmitting,
  submitted_at
) => {
  const supabase = await createClient();
  const numericAssignmentId = parseInt(assignment_id, 10);

  if (!student_code || !student_id || !numericAssignmentId) {
    console.error("Missing required parameters for saving assignment data.");
    return null;
  }

  let updatePayload = {
    student_code: student_code,
    status: "draft",
  };

  if (isSubmitting) {
    console.log("--- Starting Submission & Grading Process ---");
    try {
      // get testcases
      console.log("Step 1: Fetching assignment details...");
      const { data: assignmentDetails, error: fetchError } = await supabase
        .from("assignments")
        .select("test_cases, language")
        .eq("id", numericAssignmentId)
        .single(); // Use .single() to get one object or an error

      if (fetchError) throw fetchError;
      if (!assignmentDetails) throw new Error("Assignment not found.");

      const { test_cases: testcases, language } = assignmentDetails;

      console.log("Grading student code...");
      const gradingResult = await gradeAssignment({
        userCode: student_code,
        testcases: testcases || [],
        language: language,
      });

      if (!gradingResult) {
        throw new Error("Grading process failed to return a result.");
      }

      updatePayload = {
        ...updatePayload,
        submitted_at: submitted_at,
        status: "submitted",
        grade: gradingResult.overallScore,
        autograder_output: JSON.stringify(gradingResult.testResults),
      };
    } catch (error) {
      console.error("An error occurred during the grading process:", error);
      // Return null to indicate failure before the final DB update
      return null;
    }
  }

  console.log("Final Step: Updating database with payload:", updatePayload);
  const { error } = await supabase
    .from("assignment_students")
    .update(updatePayload)
    .eq("student_id", student_id)
    .eq("assignment_id", numericAssignmentId);

  if (error) {
    console.error("Error saving assignment data:", error.message);
    return null;
  }

  console.log("Assignment data saved to database successfully.");
  return "success";
};
