import { Suspense } from "react"
import { UserTableSkeleton } from "@/components/users/UserTableSkeleton"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your application users and their permissions.
          </p>
        </div>
      </div>

      <Suspense fallback={<UserTableSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}