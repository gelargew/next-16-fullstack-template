import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get headers for better-auth session check
  const headersList = await headers();

  // Convert ReadonlyHeaders to Headers object for better-auth
  const headersObj = new Headers();
  headersList.forEach((value: string, key: string) => {
    headersObj.set(key, value);
  });

  // Get authenticated session using better-auth
  const session = await auth.api.getSession({
    headers: headersObj,
  });

  // Check if session exists and is valid
  if (!session) {
    redirect("/auth/sign-up");
  }

  // Check if session is expired
  if (session.session?.expiresAt && new Date(session.session.expiresAt) < new Date()) {
    redirect("/auth/sign-up");
  }

  return <>{children}</>;
}
