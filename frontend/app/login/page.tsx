"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
// Background image removed; page floats over site background

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast({ title: "Logged in", description: "Welcome back!" })
      router.push("/")
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col bg-transparent"
    >
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-end items-center p-4 text-white space-x-6 text-sm">
        <Link href="/login" className="hover:underline font-semibold">Login</Link>
        <Link href="/about" className="hover:underline">About Us</Link>
        <Link href="/register" className="hover:underline">Register</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>

      {/* Form container */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6 py-8 bg-white/10 backdrop-blur-md rounded-lg">
          <h1 className="text-center text-3xl font-semibold text-white mb-6">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Username</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-slate-200"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full"
            >
              {loading ? "Signing in..." : "GET STARTED"}
            </Button>
          </form>

          <div className="flex justify-between text-xs text-slate-200 mt-4">
            <label className="flex items-center space-x-1">
              <input type="checkbox" className="h-3 w-3" />
              <span>Keep Logged In</span>
            </label>
            <Link href="#" className="hover:underline">Forgot Password?</Link>
          </div>

          <div className="mt-6 text-center text-slate-200 text-sm">
            <Link href="/register" className="hover:underline font-semibold">CREATE ACCOUNT</Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:underline">Need Help?</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-slate-200 text-xs text-center py-4">
        © 2024 PromptHero. All Rights Reserved
      </footer>
    </div>
  )
} 