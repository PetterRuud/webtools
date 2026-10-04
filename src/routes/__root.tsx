import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { ThemeProvider } from '#/components/theme-provider'
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="webtools-ui-theme"
        >
          <div
            aria-hidden
            className="atmosphere-orb atmosphere-orb-mint pointer-events-none fixed -left-24 top-10 h-72 w-72 rounded-full"
          />
          <div
            aria-hidden
            className="atmosphere-orb atmosphere-orb-gold pointer-events-none fixed -right-16 top-40 h-80 w-80 rounded-full"
            style={{ animationDelay: '-6s' }}
          />
          <Header />
          <div className="relative flex-1">{children}</div>
          <Footer />
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
