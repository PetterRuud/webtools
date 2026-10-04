import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
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
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="webtools-ui-theme"
        >
          <Header />
          <div className="relative flex-1">{children}</div>
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
