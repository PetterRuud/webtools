import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { IpLookupTool } from '#/components/tools/IpLookupTool'

export const Route = createFileRoute('/tools/ip-lookup')({
  head: () => ({
    meta: [
      { title: 'IP lookup · WebTools' },
      { name: 'description', content: 'Look up your IP or another address.' },
    ],
  }),
  component: IpLookupPage,
})

function IpLookupPage() {
  return (
    <ToolShell>
      <IpLookupTool />
    </ToolShell>
  )
}
