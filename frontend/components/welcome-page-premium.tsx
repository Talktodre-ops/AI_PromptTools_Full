"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  ListTree,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Star,
  ChevronDown,
  Rocket,
  Target,
  Lightbulb,
  Film,
  Brain,
  Wand2,
  Award,
  Shield,
  Globe,
  Users,
  BarChart3,
  Code2,
  Palette,
  Cpu,
  Image,
  Video,
  FileText,
  Bot,
  Gauge,
  Lock,
  Unlock,
  Play,
  MousePointer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface WelcomePageProps {
  onStart: () => void
}

export default function WelcomePremium({ onStart }: WelcomePageProps) {
  const [activeExample, setActiveExample] = useState("before")
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    setIsClient(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 5)
    }, 3000)

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      clearInterval(interval)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Generate perfect prompts in seconds",
      gradient: "from-yellow-400 via-amber-500 to-orange-500",
      delay: 0,
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered",
      description: "Advanced ML models optimize your prompts",
      gradient: "from-purple-400 via-pink-500 to-red-500",
      delay: 0.1,
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Ready",
      description: "Secure, scalable, and reliable",
      gradient: "from-green-400 via-teal-500 to-blue-500",
      delay: 0.2,
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Model",
      description: "Works with GPT, Claude, Gemini & more",
      gradient: "from-blue-400 via-indigo-500 to-purple-500",
      delay: 0.3,
    },
  ]

  const stats = [
    { value: "10M+", label: "Prompts Created", icon: <FileText /> },
    { value: "99.9%", label: "Uptime", icon: <Gauge /> },
    { value: "500K+", label: "Active Users", icon: <Users /> },
    { value: "4.9/5", label: "User Rating", icon: <Star /> },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "AI Researcher",
      company: "TechCorp",
      content: "This tool has revolutionized how we approach prompt engineering. The quality improvement is incredible.",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "InnovateLabs",
      content: "We've seen a 5x improvement in our AI outputs. This is a game-changer for our team.",
      avatar: "MR",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      company: "Creative Studios",
      content: "The video prompt feature alone has saved us hundreds of hours. Absolutely worth it!",
      avatar: "EW",
      rating: 5,
    },
  ]

  const promptModes = [
    { name: "Quick", icon: <Zap />, color: "text-yellow-500" },
    { name: "Deep", icon: <Layers />, color: "text-blue-500" },
    { name: "Few-Shot", icon: <ListTree />, color: "text-green-500" },
    { name: "Chain", icon: <MessageSquare />, color: "text-purple-500" },
    { name: "Video", icon: <Video />, color: "text-red-500" },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Premium Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Dynamic gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 animated-gradient opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        {/* Animated particles - only render on client to avoid hydration mismatch */}
        {isClient && (
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => {
              // Create deterministic positions using the index
              const leftPos = (i * 17 + 23) % 100;
              const topPos = (i * 31 + 7) % 100;
              const duration = ((i % 5) + 5);
              const delay = (i % 5);

              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${leftPos}%`,
                    top: `${topPos}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    delay,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Simplified floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full filter blur-3xl opacity-20" />

        {/* Main content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
            }}
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-6"
            >
              <Badge className="px-6 py-2 text-lg font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 backdrop-blur-xl">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                AI-POWERED PROMPT ENGINEERING
                <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
              </Badge>
            </motion.div>

            {/* Main title with gradient animation */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="block text-white">Transform Your</span>
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-x">
                AI Prompts
              </span>
              <span className="block text-white mt-1 sm:mt-2">Into Magic</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Experience the future of prompt engineering with our advanced AI system that creates
              <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text font-semibold"> production-ready prompts </span>
              in seconds
            </motion.p>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {promptModes.map((mode, i) => (
                <motion.div
                  key={mode.name}
                  className={cn(
                    "px-3 sm:px-4 py-2 rounded-full border border-white/20 backdrop-blur-md bg-white/5",
                    "hover:bg-white/10 transition-all cursor-pointer text-sm sm:text-base",
                    currentFeature === i && "border-white/50 bg-white/10"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={cn("flex items-center gap-2", mode.color)}>
                    {mode.icon}
                    <span className="text-white">{mode.name} Mode</span>
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col gap-4 justify-center items-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="group relative w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 overflow-hidden shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40"
                onClick={onStart}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get Started for Free
                  <ArrowRight className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/video-prompt'}
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all"
                >
                  <Video className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                  Video Prompts
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/gallery'}
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all"
                >
                  <Palette className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                  Browse Gallery
                </Button>
              </div>
            </motion.div>

            {/* Live stats */}
            <motion.div
              className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-white/50" />
        </motion.div>
      </motion.section>

      {/* Features Grid Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Supercharged Features
              </span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need to create perfect prompts</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-gray-900/80 to-black/60 border-white/20 backdrop-blur-xl hover:border-white/40 hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4 shadow-lg",
                      "group-hover:scale-110 transition-transform duration-300",
                      feature.gradient
                    )}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-white font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 relative bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                See The Transformation
              </span>
            </h2>
            <p className="text-xl text-gray-400">Watch your ideas evolve into powerful prompts</p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
            <Card className="relative bg-black/50 border-gray-800 backdrop-blur-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm text-gray-500">Input</span>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <p className="text-gray-400 italic">"Make a blog post about AI"</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="h-4 w-4 text-purple-500 animate-pulse" />
                    <span className="text-sm text-gray-500">AI-Enhanced Output</span>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800/50">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
{`Write a comprehensive blog post about artificial intelligence that:

1. Opens with a compelling hook about AI's impact
2. Covers current applications in healthcare, finance, and education
3. Addresses ethical considerations and potential risks
4. Includes 3-5 real-world case studies
5. Concludes with future predictions for the next decade

Tone: Professional yet accessible
Length: 1500-2000 words
Style: Engaging storytelling with data-backed insights`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={onStart}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Try Free Demo
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 md:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Loved By Thousands
              </span>
            </h2>
            <p className="text-xl text-gray-400">See what our users are saying</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-gradient-to-br from-gray-900/80 to-black/60 border-white/20 backdrop-blur-xl hover:border-white/40 hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      ))}
                    </div>
                    <p className="text-gray-100 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-200">{testimonial.role} at {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 blur-3xl" />
            <Card className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/30 backdrop-blur-xl p-12 shadow-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg px-4">
                Ready to Transform Your AI Experience?
              </h2>
              <p className="text-lg sm:text-xl text-gray-100 mb-8 drop-shadow-md px-4">
                Join the revolution in prompt engineering. Start creating amazing prompts today.
              </p>

              {/* Developer Attribution */}
              <div className="mb-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-400/40 backdrop-blur-md shadow-lg mx-4">
                <p className="text-sm sm:text-lg text-gray-100 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-medium text-center">
                  <span>💻 Crafted with passion by</span>
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold text-lg sm:text-xl">
                    @Talktodre-ops
                  </span>
                  <span className="hidden sm:inline">- Your AI Development Partner</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200 mt-2 text-center">
                  🌟 Follow my journey building cutting-edge AI tools for the community!
                </p>
              </div>
              <div className="flex justify-center px-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-12 py-6 sm:py-8 text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 group"
                  onClick={onStart}
                >
                  <Unlock className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-center leading-tight">
                    Get Started for Free
                  </span>
                  <Sparkles className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}