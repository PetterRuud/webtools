import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { DnsLookupTool } from '#/components/tools/DnsLookupTool'

export const Route = createFileRoute('/tools/dns-lookup')({
  head: () => ({
    meta: [
      { title: 'DNS lookup · WebTools' },
      { name: 'description', content: 'DNS over HTTPS lookup via Cloudflare.' },
    ],
  }),
  component: DnsLookupPage,
})

function DnsLookupPage() {
  return (
    <ToolShell title="DNS lookup">
      <DnsLookupTool />
    </ToolShell>
  )
}
