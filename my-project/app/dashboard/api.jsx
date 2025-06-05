

import { supabase } from ".././supabase-client";
export const insertUserIfNew = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) return;

      // ✅ Check if the user was created within the last 1 minute
      const userCreatedAt = new Date(user.created_at);
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute ago

      if (userCreatedAt > oneMinuteAgo) {
        // Insert into users table
        const { data, error: dbError } = await supabase
          .from("users")
          .insert([{ id: user.id, email: user.email, role: "teacher" }]);

        if (dbError) {
          console.error("Error inserting user:", dbError.message);
        } else {
          console.log("User successfully inserted:", data);
        }
      } else {
        console.log("User already exists or was created earlier — skipping insert.");
      }
};
    


// Server side code for assignments page. 