"use client"

import * as React from "react"
import { Eye, EyeOff, Upload, X } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Input as UIInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel as UIFormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

// Form wrapper component that extends FormField
interface FormProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
}

const FormWrapper = React.forwardRef<HTMLDivElement, FormProps>(
  ({ name, className, children, ...props }, ref) => {
    return (
      <FormField name={name}>
        {({ value, onChange, onBlur, error }) => (
          <div ref={ref} className={className} {...props}>
            {children}
          </div>
        )}
      </FormField>
    )
  }
)
FormWrapper.displayName = "FormWrapper"

// Create the compound Form component
const Form = Object.assign(FormWrapper, {
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  Upload: FormUpload,
})

// Input Component
interface FormInputProps {
  name: string
  label?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url"
  required?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
}

function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  required,
  disabled,
  className,
  inputClassName,
}: FormInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error }) => (
        <FormItem className={className}>
          {label && (
            <UIFormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </UIFormLabel>
          )}
          <FormControl>
            <div className="relative">
              <UIInput
                type={type === "password" && showPassword ? "text" : type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  error && "border-destructive focus:border-destructive",
                  inputClassName
                )}
              />
              {type === "password" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={disabled}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    </FormField>
  )
}

// Textarea Component
interface FormTextareaProps {
  name: string
  label?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  className?: string
  textareaClassName?: string
}

function FormTextarea({
  name,
  label,
  placeholder,
  rows = 3,
  required,
  disabled,
  className,
  textareaClassName,
}: FormTextareaProps) {
  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error }) => (
        <FormItem className={className}>
          {label && (
            <UIFormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </UIFormLabel>
          )}
          <FormControl>
            <textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive focus:border-destructive",
                textareaClassName
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    </FormField>
  )
}

// Select Component
interface FormSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  required?: boolean
  disabled?: boolean
  className?: string
  selectClassName?: string
}

function FormSelect({
  name,
  label,
  placeholder,
  options,
  required,
  disabled,
  className,
  selectClassName,
}: FormSelectProps) {
  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error }) => (
        <FormItem className={className}>
          {label && (
            <UIFormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </UIFormLabel>
          )}
          <FormControl>
            <select
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive focus:border-destructive",
                selectClassName
              )}
            >
              <option value="" disabled>
                {placeholder || "Select an option"}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    </FormField>
  )
}

// Checkbox Component
interface FormCheckboxProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function FormCheckbox({
  name,
  label,
  description,
  required,
  disabled,
  className,
}: FormCheckboxProps) {
  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              disabled={disabled}
              className={cn(
                "h-4 w-4 rounded border border-primary text-primary focus:ring-primary",
                error && "border-destructive focus:border-destructive"
              )}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <UIFormLabel className="cursor-pointer">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </UIFormLabel>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    </FormField>
  )
}

// Upload Component
interface FileUpload {
  file: File
  preview?: string
  id: string
}

interface FormUploadProps {
  name: string
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  required?: boolean
  disabled?: boolean
  className?: string
  onFileSelect?: (files: File[]) => void
}

function FormUpload({
  name,
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  required,
  disabled,
  className,
  onFileSelect,
}: FormUploadProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <FormField name={name}>
      {({ value, onChange, error }) => {
        const files: FileUpload[] = value || []

        const handleFiles = (newFiles: FileList | null) => {
          if (!newFiles) return

          const validFiles: File[] = []
          const existingFiles = files.map(f => f.file.name)

          Array.from(newFiles).forEach((file) => {
            // Check if file already exists
            if (existingFiles.includes(file.name)) {
              return
            }

            // Check file size
            if (file.size > maxSize) {
              return
            }

            validFiles.push(file)
          })

          // Check max files limit
          if (files.length + validFiles.length > maxFiles) {
            return
          }

          const newFileUploads: FileUpload[] = validFiles.map((file) => {
            const preview = file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined
            return {
              file,
              preview,
              id: Math.random().toString(36).substr(2, 9),
            }
          })

          const updatedFiles = [...files, ...newFileUploads]
          onChange(updatedFiles)
          onFileSelect?.(updatedFiles.map(f => f.file))
        }

        const removeFile = (id: string) => {
          const updatedFiles = files.filter(f => f.id !== id)
          onChange(updatedFiles)
          onFileSelect?.(updatedFiles.map(f => f.file))
        }

        return (
          <FormItem className={className}>
            {label && (
              <UIFormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </UIFormLabel>
            )}
            <FormControl>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  disabled && "opacity-50 cursor-not-allowed",
                  error && "border-destructive"
                )}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!disabled) setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                  if (!disabled) {
                    handleFiles(e.dataTransfer.files)
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  disabled={disabled}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />

                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {dragActive ? "Drop files here" : "Upload files"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop files here, or click to select files
                  </p>
                  {maxSize && (
                    <p className="text-xs text-muted-foreground">
                      Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
                    </p>
                  )}
                  {maxFiles && (
                    <p className="text-xs text-muted-foreground">
                      Max files: {maxFiles}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  Select Files
                </Button>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((fileUpload) => (
                    <div
                      key={fileUpload.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        {fileUpload.preview ? (
                          <img
                            src={fileUpload.preview}
                            alt={fileUpload.file.name}
                            className="h-8 w-8 object-cover rounded"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-muted-foreground/20 rounded flex items-center justify-center">
                            <Upload className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium truncate">
                            {fileUpload.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(fileUpload.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileUpload.id)}
                        disabled={disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    </FormField>
  )
}

// Export the compound Form component
export { Form }