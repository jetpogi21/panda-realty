"use client";

import { useMutation } from "@tanstack/react-query";
import { Form, Formik, FormikHelpers } from "formik";
import loginSchema from "@/schema/login";
import { Icons } from "@/components/Icons";
import { FormikInput } from "@/components/formik/FormikInput";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/supabase/signIn";
import { toast } from "@/hooks/use-toast";

interface FormValues {
  email: string;
  password: string;
}

export const LoginForm: React.FC = (props) => {
  const router = useRouter();
  const [error, setError] = useState("");

  const initialValues: FormValues = {
    email: "jet_pradas@yahoo.com",
    password: "Jetpogi_21",
  };

  const login = async (values: FormValues) => {
    const email = values.email;
    const password = values.password;
    const result = await signIn({ email, password });

    if (result.error) {
      setError(result.error);
    } else {
      router.replace("/");
      router.refresh();
    }
  };

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      //router.push("/dashboard");
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    // Use useMutation here from react-query
    mutate(values);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center flex-1 text-sm">
      <h1 className="my-5 text-5xl">Login</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
      >
        {({ isSubmitting, submitForm }) => (
          <Form
            className="flex flex-col gap-4 w-full px-4 md:w-[400px]"
            noValidate={true}
          >
            {!!error && <Alert variant={"destructive"}>{error}</Alert>}
            <FormikInput
              name="email"
              label="Email"
              placeholder="Email"
              setFocusOnLoad={true}
              required
            />
            <FormikInput
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              required
            />

            <Link
              href="/forgot-password"
              className="text-right"
            >
              Forgot password?
            </Link>
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting || isLoading}
              className="rounded-full"
            >
              Login
            </Button>
            <span className="py-2 font-bold text-center">Or</span>
            <Button
              variant={"secondary"}
              type="button"
              onClick={async () => {
                const { data, error } = await signInWithGoogle();

                if (error) {
                  console.log(error);
                  toast({
                    variant: "destructive",
                    description: "Something went wrong!",
                  });
                  return;
                }

                router.refresh();
              }}
              disabled={isSubmitting || isLoading}
              className="relative tracking-wider rounded-full"
            >
              <Icons.google className="absolute w-5 h-5 left-4" /> Continue with
              Google
            </Button>
            <Link
              href="/register"
              className="text-center text-primary"
            >
              Register for an account
            </Link>
          </Form>
        )}
      </Formik>
    </div>
  );
};
