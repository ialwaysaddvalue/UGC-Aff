import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'UGC-Aff — AI Content Monetization Platform',
  description: 'Create viral UGC videos with AI and monetize with affiliate marketing. Powered by HeyGen, Higgsfield, Claude, and OpenAI.',
  keywords: ['UGC', 'affiliate marketing', 'AI video', 'content creation', 'TikTok', 'Instagram Reels'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-60 min-h-screen">
            {children}
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  )
}
