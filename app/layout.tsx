import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'BrJobsInsights | Mercado de TI no Brasil',
  description: 'Dashboard analítico do mercado de trabalho de TI no Brasil. Dados do CAGED processados mensalmente mostrando onde estão crescendo as vagas de tecnologia.',
  keywords: ['empregos TI', 'vagas tecnologia', 'CAGED', 'mercado de trabalho', 'Brasil', 'dados'],
  authors: [{ name: 'Jonas Ferreira Silva' }],
  openGraph: {
    title: 'BrJobsInsights | Mercado de TI no Brasil',
    description: 'Descubra onde estão crescendo as vagas de TI no Brasil com dados oficiais do CAGED.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1419',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
