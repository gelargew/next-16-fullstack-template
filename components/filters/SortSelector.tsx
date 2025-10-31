"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SortSelectorProps {
  currentSortField: string
  currentSortDirection: 'asc' | 'desc'
  sortOptions: Record<string, { label: string; field: string }>
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  label?: string
  className?: string
}

export function SortSelector({
  currentSortField,
  currentSortDirection,
  sortOptions,
  onSortChange,
  label = "Sort",
  className = "",
}: SortSelectorProps) {
  const currentSort = sortOptions[currentSortField]

  const handleSortClick = (field: string) => {
    if (field === currentSortField) {
      // Toggle direction if same field
      const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc'
      onSortChange(field, newDirection)
    } else {
      // Default to 'desc' for new field
      onSortChange(field, 'desc')
    }
  }

  const getSortIcon = () => {
    if (currentSortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    }
    return <ArrowDown className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`${className}`}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {label}
          {currentSort && (
            <>
              <span className="ml-1 hidden sm:inline">: {currentSort.label}</span>
              {getSortIcon()}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {Object.entries(sortOptions).map(([key, option]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleSortClick(key)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {key === currentSortField && getSortIcon()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}