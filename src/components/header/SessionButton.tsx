import SignOutButton from "@/components/header/SignOutButton";
import { Button } from "@/components/ui/Button";
import { createSupabaseServer } from "@/lib/supabase/supabase";
import { cookies } from "next/headers";
import Link from "next/link";

const SessionButton: React.FC = async () => {
  const cookieStore = cookies();

  const supabase = createSupabaseServer(cookieStore);
  const { data, error } = await supabase.auth.getSession();

  return data.session ? (
    <SignOutButton />
  ) : (
    <Button
      asChild
      className="rounded-full"
    >
      <Link href="/login">Sign-in</Link>
    </Button>
  );
};

export default SessionButton;
