"use client";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/supabase/signOut";
import { useRouter } from "next/navigation";
import React from "react";

const SignOutButton = () => {
  const router = useRouter();
  const handleSignOut = async () => {
    const error = await signOut();
    if (!error) {
      router.refresh();
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="rounded-full bg-secondary"
    >
      Logout
    </Button>
  );
};

export default SignOutButton;
