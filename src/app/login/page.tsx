import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { AUTH_COOKIE_NAME, getSafeRedirectPath, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeRedirectPath(params.next);

  if (!isAuthEnabled()) {
    redirect(nextPath);
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (await isValidAuthCookie(authCookie)) {
    redirect(nextPath);
  }

  return (
    <main className="shell loginShell">
      <LoginForm />
    </main>
  );
}
