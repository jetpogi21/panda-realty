"use client";
import { useMutation } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import React from "react";
import resetPasswordSchema from "@/schema/reset-password";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/supabase";
import { toast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";

interface FormValues {
  password: string;
  passwordConfirmation: string;
}

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();

  const initialValues: FormValues = {
    password: "Jetpogi_21",
    passwordConfirmation: "Jetpogi_21",
  };

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (password: string) => {
      return await supabase.auth.updateUser({ password });
    },
    onSuccess: ({ data, error }) => {
      if (!error) {
        toast({
          description: "Password successfully updated.",
          variant: "success",
        });
        router.push("/");
        return;
      }

      toast({
        description: (error.name = "AuthSessionMissingError"
          ? "Link has expired. Please send a new reset link to your email."
          : error.message),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    // Use useMutation here from react-query
    resetPassword(values.password);
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={resetPasswordSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4 w-full px-4 md:w-[400px]">
          <Field
            type="text"
            name="password"
            placeholder="Password"
            as={Input}
            required
          />
          <ErrorMessage
            name="password"
            component="div"
            className="text-sm text-red-500"
          />

          <Field
            type="password"
            name="passwordConfirmation"
            placeholder="Confirm Password"
            as={Input}
            required
          />
          <ErrorMessage
            name="passwordConfirmation"
            component="div"
            className="text-sm text-red-500"
          />

          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting || isPending}
            className="rounded-full"
          >
            Confirm reset
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
