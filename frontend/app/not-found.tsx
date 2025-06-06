"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page after a short delay
    const timeout = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Page Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Redirecting you to the home page...
        </p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-full animate-progress"></div>
        </div>
      </div>
    </div>
  )
} 