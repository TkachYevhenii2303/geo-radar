"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, PasswordInput, Text, TextInput } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import styles from "./signup-container.module.scss";

const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(32, "Name must be at most 32 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupContainer() {
  const { register } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await register(values);
      toast.success("Account created! Welcome to GEO Radar.");
      router.push("/");
    } catch (err: unknown) {
      const message =
        extractErrorMessage(err) ?? "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <Card className={styles.card} shadow="sm" withBorder>
      <Text className={styles.title}>Create an account</Text>
      <Text className={styles.subtitle}>
        Join GEO Radar and start monitoring
      </Text>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Create account"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Full name"
              placeholder="John Doe"
              autoComplete="name"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Email address"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              label="Password"
              placeholder="Min 8 chars, uppercase, digit, special"
              autoComplete="new-password"
              error={errors.password?.message}
            />
          )}
        />

        <Button type="submit" fullWidth loading={isSubmitting} mt="xs">
          Create account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </Card>
  );
}
