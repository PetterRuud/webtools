import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  DESC_LIMIT_PX_EXPORT,
  SERP_SAMPLE,
  TITLE_LIMIT_PX_EXPORT,
  buildSerpPreview,
} from '#/lib/serpPreview'
import { cn } from 'cn'

export function SerpPreviewTool() {
  const [title, setTitle] = useState(SERP_SAMPLE.title)
  const [description, setDescription] = useState(SERP_SAMPLE.description)
  const [url, setUrl] = useState(SERP_SAMPLE.url)

  const preview = useMemo(
    () => buildSerpPreview({ title, description, url }),
    [title, description, url],
  )

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="serp-title" className="text-xs font-normal text-muted-foreground">
              Title
            </Label>
            <span
              className={cn(
                'font-mono text-[0.7rem] tabular-nums',
                preview.titleOver
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground',
              )}
            >
              {preview.titleChars} chars · {preview.titlePx}px / {TITLE_LIMIT_PX_EXPORT}px
            </span>
          </div>
          <Input
            id="serp-title"
            value={title}
            onValueChange={setTitle}
            placeholder="Page title"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <Label
              htmlFor="serp-desc"
              className="text-xs font-normal text-muted-foreground"
            >
              Description
            </Label>
            <span
              className={cn(
                'font-mono text-[0.7rem] tabular-nums',
                preview.descriptionOver
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground',
              )}
            >
              {preview.descriptionChars} chars · {preview.descriptionPx}px /{' '}
              {DESC_LIMIT_PX_EXPORT}px
            </span>
          </div>
          <Textarea
            id="serp-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 text-sm"
            placeholder="Meta description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="serp-url" className="text-xs font-normal text-muted-foreground">
            URL
          </Label>
          <Input
            id="serp-url"
            value={url}
            onValueChange={setUrl}
            placeholder="https://example.com/page"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <section className="rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          <h2 className="m-0 mb-3 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
            Google preview
          </h2>
          <div className="max-w-xl font-[arial,sans-serif]">
            <p className="m-0 truncate text-[14px] leading-5 text-[#202124] dark:text-[#e8eaed]">
              {preview.displayUrl}
            </p>
            <p className="m-0 mt-1 text-[20px] leading-6 text-[#1a0dab] dark:text-[#8ab4f8]">
              {preview.titleTruncated || 'Page title'}
            </p>
            <p className="m-0 mt-1 text-[14px] leading-5 text-[#4d5156] dark:text-[#bdc1c6]">
              {preview.descriptionTruncated || 'Meta description'}
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              await copyText(preview.titleTruncated)
              toast.success('Title copied')
            }}
          >
            <CopyIcon data-icon="inline-start" />
            Title
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              await copyText(preview.descriptionTruncated)
              toast.success('Description copied')
            }}
          >
            <CopyIcon data-icon="inline-start" />
            Description
          </Button>
        </div>
      </div>
    </div>
  )
}
