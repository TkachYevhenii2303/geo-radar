"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, PasswordInput, Text, TextInput } from "@mantine/core";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import styles from "./login-container.module.scss";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginContainer() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      router.push(redirectTo);
    } catch (err: unknown) {
      const message = extractErrorMessage(err) ?? "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <Card className={styles.card} shadow="sm" withBorder>
      <Text className={styles.title}>Welcome back</Text>
      <Text className={styles.subtitle}>Sign in to your GEO Radar account</Text>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Sign in"
      >
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
              placeholder="Your password"
              autoComplete="current-password"
              error={errors.password?.message}
            />
          )}
        />

        <Button type="submit" fullWidth loading={isSubmitting} mt="xs">
          Sign in
        </Button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account? <Link href="/signup">Create one</Link>
      </p>
    </Card>
  );
}
