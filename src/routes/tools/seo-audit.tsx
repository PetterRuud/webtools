import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { SeoAuditTool } from '#/components/tools/SeoAuditTool'

export const Route = createFileRoute('/tools/seo-audit')({
  head: () => ({
    meta: [
      { title: 'SEO audit · WebTools' },
      {
        name: 'description',
        content:
          'Fetch a page and report prioritized technical and on-page SEO issues with pass/warn/fail.',
      },
    ],
  }),
  component: SeoAuditPage,
})

function SeoAuditPage() {
  return (
    <ToolShell>
      <SeoAuditTool />
    </ToolShell>
  )
}
