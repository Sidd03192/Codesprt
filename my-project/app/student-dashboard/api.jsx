export const getAssignmentsForClass = async ({ class_id }) => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("class_id", class_id);
  if (error) {
    console.error("Error fetching assignments:", error.message);
    alert(error.message);
    return;
  } else {
    return data;
  }
};
