import { supabase } from "@/lib/supabase/supabase";
import { useQuery } from "@tanstack/react-query";

import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type State = {
  session?: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useSessionStore = create<State>((set) => ({
  loading: true,
  setSession: (session) => set(() => ({ session })),
  setLoading: (loading) => set(() => ({ loading })),
}));

export const useAuthSession = () => {
  const _ = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      return await supabase.auth.getSession();
    },
  });

  return _;
};
