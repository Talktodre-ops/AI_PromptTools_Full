"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchFromApi } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
// Background image removed; transparent backdrop

interface RegisterForm {
  email: string
  password: string
  display_name?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<RegisterForm>({ email: "", password: "", display_name: "" })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetchFromApi("/register", {
        method: "POST",
        body: JSON.stringify(form),
      })
      toast({ title: "Account created", description: "Please log in." })
      router.push("/login")
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col bg-transparent"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <nav className="relative z-10 flex justify-end items-center p-4 text-white space-x-6 text-sm">
        <Link href="/login" className="hover:underline">Login</Link>
        <Link href="/about" className="hover:underline">About Us</Link>
        <Link href="/register" className="hover:underline font-semibold">Register</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6 py-8 bg-white/10 backdrop-blur-md rounded-lg">
          <h1 className="text-center text-3xl font-semibold text-white mb-6">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="display_name" className="text-white">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={form.display_name}
                onChange={handleChange}
                className="bg-white/20 text-white placeholder:text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-white/20 text-white placeholder:text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="bg-white/20 text-white placeholder:text-slate-200"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full"
            >
              {loading ? "Creating..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <div className="mt-6 text-center text-slate-200 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="hover:underline font-semibold">Log in</Link>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-slate-200 text-xs text-center py-4">
        © 2024 PromptHero. All Rights Reserved
      </footer>
    </div>
  )
} 