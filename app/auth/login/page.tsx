import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="w-full max-w-md animate-pulse bg-muted rounded-xl h-96" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
