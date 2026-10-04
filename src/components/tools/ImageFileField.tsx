import type { ComponentProps, ReactNode, Ref } from 'react'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from 'cn'

/** Shared file-button chrome for image tools (pairs with Input type=file h-auto). */
export const imageFileInputClassName =
  'file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80'

/** Full-size preview — never clip with fixed/max height. */
export const imagePreviewClassName =
  'mx-auto h-auto w-full max-w-full object-contain'

type ImageFileFieldProps = {
  id: string
  label?: ReactNode
  accept?: string
  onFile: (file: File | null) => void
  meta?: ReactNode
  className?: string
  inputClassName?: string
  inputRef?: Ref<HTMLInputElement>
} & Omit<ComponentProps<typeof Input>, 'id' | 'type' | 'accept' | 'onChange' | 'className'>

export function ImageFileField({
  id,
  label = 'Image',
  accept = 'image/*',
  onFile,
  meta,
  className,
  inputClassName,
  inputRef,
  ...inputProps
}: ImageFileFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...inputProps}
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className={cn(imageFileInputClassName, inputClassName)}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      {meta}
    </div>
  )
}

type ImagePreviewFrameProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
}

export function ImagePreviewFrame({
  children,
  className,
  innerClassName,
}: ImagePreviewFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border/80 bg-muted/40 p-3',
        className,
      )}
    >
      <div className={cn('overflow-hidden rounded-md bg-card/80', innerClassName)}>
        {children}
      </div>
    </div>
  )
}
