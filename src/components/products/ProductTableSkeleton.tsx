"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </TableCell>
              <TableCell>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </TableCell>
              <TableCell>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

