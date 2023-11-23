import { supabase } from "@/lib/supabase/supabase";
import registrationSchema from "@/schema/registration";
import handleSequelizeError from "@/utils/errorHandling";
import { returnJSONResponse } from "@/utils/utils";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const res = await req.json();

  const email = res.email;
  const password = res.password;
  const passwordConfirmation = res.email_verification_status;

  try {
    await registrationSchema.validate(res);
  } catch (error) {
    return handleSequelizeError(error);
  }

  const { data: existingUser } = await supabase
    .from("email_verification_status")
    .select("status")
    .eq("email", email)
    .single();

  if (existingUser && existingUser.status === "sent") {
    return returnJSONResponse({
      status: "error",
      error:
        "An email has already been sent to the email you provided and is pending verification.",
      errorCode: 200,
    });
  }

  if (existingUser && existingUser.status === "verified") {
    return returnJSONResponse({
      status: "error",
      error: "Email address is already taken.",
      errorCode: 200,
    });
  }

  try {
    let { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return handleSequelizeError(error);
    }

    if (data) {
      await supabase
        .from("email_verification_status")
        .upsert([{ email, status: "sent" }]);
    }

    return NextResponse.json({
      status: "success",
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err,
    });
  }
};
