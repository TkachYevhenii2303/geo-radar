import { Suspense } from "react";
import { LoginContainer } from "@/components/auth/login/LoginContainer";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContainer />
    </Suspense>
  );
}
