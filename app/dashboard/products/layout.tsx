import { Suspense } from "react"
import { ProductTableSkeleton } from "@/components/products/ProductTableSkeleton"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
      </div>

      <Suspense fallback={<ProductTableSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}

