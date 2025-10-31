import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
