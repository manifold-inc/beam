import { ThemeProvider } from 'next-themes'
import 'styles/globals.css'
import { PropsWithChildren } from 'react'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Beam",
  description: "Manifolds internal blog",
};

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
