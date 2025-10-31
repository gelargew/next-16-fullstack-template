"use client"

import * as React from "react"
import { Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm as useFormHook, FormProvider, useFormContext, type UseFormReturn, type FieldValues, type SubmitHandler } from "react-hook-form"
import { type ZodSchema } from "zod"
import { cn } from "@/lib/utils"

interface FormProps<T extends FieldValues> extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<T>
  onSubmit?: SubmitHandler<T>
  children: React.ReactNode
}

function Form<T extends FieldValues>({ form, onSubmit, className, ...props }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
        className={cn("space-y-6", className)}
        {...props}
      >
        {props.children}
      </form>
    </FormProvider>
  )
}

// Hook to access form context
function useFormField<T extends FieldValues>() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext<T>()

  const fieldState = getFieldState(fieldContext.name as any, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// Context for field name
const FormFieldContext = React.createContext<{
  name: string
}>({ name: '' })

// Context for form item
const FormItemContext = React.createContext<{
  id: string
}>({} as any)

// Form Field wrapper
interface FormFieldProps<T extends FieldValues> {
  name: string
  children: (field: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    error?: string
    touched: boolean
  }) => React.ReactNode
}

function FormField<T extends FieldValues>({ name, children }: FormFieldProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        name={name as any}
        control={control}
        render={({ field, fieldState }) => (
          <FormItem>
            {children({
              value: field.value,
              onChange: field.onChange,
              onBlur: field.onBlur,
              error: fieldState.error?.message,
              touched: fieldState.isTouched,
            })}
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  )
}

// Form Item wrapper
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function FormLabel({ className, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField()

  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  )
}

// Form Control
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormControl({ ...props }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

// Form Description
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// Form Message
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormMessage({ className, children, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

// Hook for creating form
function useForm<T extends FieldValues>(
  defaultValues: Partial<T>,
  _schema?: ZodSchema<T>
): UseFormReturn<T> {
  return useFormHook<T>({
    defaultValues: defaultValues as any,
    // resolver: (schema ? zodResolver(schema) : undefined) as any,
    mode: "onChange",
  }) as unknown as UseFormReturn<T>
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useForm,
}