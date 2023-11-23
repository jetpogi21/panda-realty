"use client";
import { supabase } from "@/lib/supabase/supabase";
import { useSessionStore } from "@/lib/supabase/useAuthSession";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const SessionProvider = () => {
  const router = useRouter();
  const { setSession, setLoading } = useSessionStore((state) => ({
    setSession: state.setSession,
    setLoading: state.setLoading,
  }));

  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      return await supabase.auth.getSession();
    },
  });

  const session = data?.data.session || null;

  useEffect(() => {
    setSession(session);
    setLoading(false);
    if (session?.access_token) {
      router.refresh();
    }
  }, [session]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        switch (event) {
          case "SIGNED_IN":
            setSession(session!);
            break;
          case "SIGNED_OUT":
            setSession(null);
            router.push("/login");
            break;
          case "PASSWORD_RECOVERY":
            setSession(null);

            break;
          case "USER_UPDATED":
            setSession(session);

            break;
          case "INITIAL_SESSION":
            break;
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return null;
};

export default SessionProvider;
