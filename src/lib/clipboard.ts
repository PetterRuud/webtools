import { toast } from 'sonner'

export async function copyText(value: string, label = 'result') {
  if (!value) {
    toast.error('Nothing to copy')
    return
  }
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${label}`)
  } catch {
    toast.error('Clipboard unavailable')
  }
}
