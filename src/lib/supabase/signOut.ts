import { supabase } from "@/lib/supabase/supabase";

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error;
};
