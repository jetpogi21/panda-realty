import { supabase } from "@/lib/supabase/supabase";

interface SignInProps {
  email: string;
  password: string;
}
export const signIn = async ({ email, password }: SignInProps) => {
  const {
    error,
    data: { user, session },
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { user, session };
};

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    /* "http://localhost:3000/"; */
    process?.env?.NEXT_PUBLIC_DOMAIN!;
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const signInWithGoogle = async () => {
  console.log(getURL());

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getURL(),
    },
  });

  return { data, error };
};
