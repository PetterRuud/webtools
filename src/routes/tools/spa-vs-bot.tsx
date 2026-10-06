import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy slug → Crawler simulator */
export const Route = createFileRoute('/tools/spa-vs-bot')({
  beforeLoad: () => {
    throw redirect({ to: '/tools/crawler-simulator' })
  },
})
