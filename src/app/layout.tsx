import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Girl Scouts Cookie Payment',
  description: 'Mobile-first web app for Girl Scouts cookie sales and payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-girl-scout-green text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">Girl Scouts Cookie Sales</h1>
            </div>
          </header>
          <main className="container mx-auto py-4 px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}