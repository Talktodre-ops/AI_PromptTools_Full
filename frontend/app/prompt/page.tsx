"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This component handles client-side redirects for static exports
export default function PromptRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main page with the view=prompt query parameter
    router.replace('/?view=prompt')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Redirecting...</h1>
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div className="bg-indigo-500 h-full animate-progress"></div>
        </div>
      </div>
    </div>
  )
} 