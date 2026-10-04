import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { SitemapGeneratorTool } from '#/components/tools/SitemapGeneratorTool'

export const Route = createFileRoute('/tools/sitemap')({
  head: () => ({
    meta: [
      { title: 'Sitemap generator · WebTools' },
      {
        name: 'description',
        content:
          'Build sitemap.xml from a pasted URL list. Optional lastmod, changefreq, priority.',
      },
    ],
  }),
  component: SitemapPage,
})

function SitemapPage() {
  return (
    <ToolShell>
      <SitemapGeneratorTool />
    </ToolShell>
  )
}
