import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Toaster } from '#/components/ui/sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'WebTools',
      },
      {
        name: 'description',
        content:
          'Personal browser tools on Cloudflare Workers — converters, compressors, and more.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <div
          aria-hidden
          className="atmosphere-orb pointer-events-none fixed -left-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.08_165_/_0.45),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden
          className="atmosphere-orb pointer-events-none fixed -right-16 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,oklch(0.86_0.1_75_/_0.35),transparent_70%)] blur-2xl"
          style={{ animationDelay: '-6s' }}
        />
        <Header />
        <div className="relative flex-1">{children}</div>
        <Footer />
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
