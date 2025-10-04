import './globals.css'
import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter, Poppins } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from '@/components/ui/sonner'
import ServiceWorkerRegistrar from '@/components/providers/ServiceWorkerRegistrar'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ weight: ['400','500','600','700'], subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'resQ - Emergency Alerts & Assistance',
  description: 'Unified emergency alerts and assistance app with real-time updates, evacuation routes, and community support.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'resQ'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <ClerkProvider>

    <html lang="en" suppressHydrationWarning>
    <body className={`${inter.className} ${poppins.className}`}>
        <SignedOut>
            
            </SignedOut>
            <SignedIn>
              {/* UserButton removed, now using Avatar in AppShell on dashboard */}
            </SignedIn>
        <Providers>
          {children}
          <Toaster />
      <ServiceWorkerRegistrar />
        </Providers>
      </body>
    </html>
     </ClerkProvider>
  )
}