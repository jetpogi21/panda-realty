"use client";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login/LoginForm";
import { useSessionStore } from "@/lib/supabase/useAuthSession";

const Login = () => {
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const loading = useSessionStore((state) => state.loading);
  if (session && !loading) {
    router.replace("/");
  }

  return loading ? <div className="flex-1"></div> : <LoginForm />;
};

export default Login;
