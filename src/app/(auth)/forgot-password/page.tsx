"use client";
import * as Yup from "yup";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { useState } from "react";
import axiosClient from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/supabase/useAuthSession";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";

interface FormValues {
  email: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Please enter a valid email address"),
});

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const loading = useSessionStore((state) => state.loading);
  if (session && !loading) {
    router.replace("/");
  }

  return loading ? null : <EmailForm />;
};

const EmailForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { mutate: sendResetPasswordLink, isPending } = useMutation({
    mutationFn: async (email: string) => {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_DOMAIN! + "/reset-password",
      });
    },
    onSuccess: () => {
      toast({
        description: "A password reset link was sent to your email.",
        variant: "success",
      });
    },
  });

  const handleContinueClick = async () => {
    try {
      await validationSchema.validate({ email });
      setError("");
      sendResetPasswordLink(email);
    } catch (e: any) {
      console.log(e);
      setError(e.message);
    }
  };

  const handleEmailChange = (e: any) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };

  return (
    <div className="flex flex-col items-center flex-1 text-sm w-full max-w-[400px] mx-auto gap-8">
      <h1 className="my-5 text-4xl">Reset your password</h1>
      <p>
        Enter the email address associated with your account and we&apos;ll send
        you a link to reset your password.
      </p>
      <div className="flex flex-col w-full gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          value={email}
          onChange={handleEmailChange}
        />
        {Boolean(error) && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
      <Button
        className="w-full"
        onClick={handleContinueClick}
        isLoading={isPending}
      >
        Continue
      </Button>
      <div>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
