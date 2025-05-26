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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WelcomePageProps {
  onStart: () => void;
}

export default function WelcomePage({ onStart }: WelcomePageProps) {
  const [activeExample, setActiveExample] = useState("before")
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const examplesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToExamples = () => {
    examplesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Quick Mode",
      description: "Get instant, one-liner prompts for rapid prototyping and testing",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      icon: <Layers className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Deep Mode",
      description: "Detailed, structured prompts with comprehensive instructions",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      icon: <ListTree className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Few-Shot Learning",
      description: "Prompts with examples to guide AI behavior and output style",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      icon: <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Chain-of-Thought",
      description: "Step-by-step reasoning prompts for complex problem solving",
      gradient: "from-purple-400 to-pink-500",
    },
  ]

  const benefits = [
    { icon: <Target className="h-5 w-5 sm:h-6 sm:w-6" />, text: "Save hours of prompt iteration and testing" },
    { icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />, text: "Improve AI output quality by 3-5x" },
    { icon: <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />, text: "Learn prompt engineering best practices" },
    { icon: <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />, text: "Support for multiple AI models and use cases" },
  ]

  const stats = [
    { number: "50K+", label: "Prompts Generated", icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { number: "5x", label: "Better AI Outputs", icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { number: "100%", label: "Free to Use", icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> },
  ]

  const exampleBefore = "I need to write something about climate change that's persuasive"

  const exampleAfter = `Write a persuasive article about climate change that addresses the following aspects:

1. The scientific consensus on human-caused climate change
2. The most significant current and projected impacts  
3. Why immediate action is necessary
4. 5-7 practical steps individuals can take to reduce their carbon footprint
5. How these individual actions connect to broader systemic change

Use a tone that creates urgency without inducing despair, and include credible data points to support your arguments.`

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Hero Section - Adjusted for mobile */}
      <section className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden z-10">
        {/* Animated Background - Keep existing code */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fillOpacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

          {/* Floating Elements - Responsive */}
          <div className="absolute top-10 left-5 w-32 h-32 sm:top-20 sm:left-10 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-20 right-5 w-32 h-32 sm:top-40 sm:right-10 sm:w-72 sm:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 sm:-bottom-8 sm:left-20 sm:w-72 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content - Adjusted for mobile */}
        <div className="relative z-20 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-0">
          <div className="w-full max-w-7xl mx-auto text-center">
            <div className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="space-y-4 sm:space-y-6">
                {/* Badge - Adjusted size */}
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5 mr-2 animate-pulse" />
                  AI-Powered Prompt Engineering
                </Badge>

                {/* Title - Adjusted font sizes and spacing */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight px-2 sm:px-0">
                  Transform
                  <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x mt-2">
                    Messy Thoughts
                  </span>
                  <span className="block mt-2">into Perfect Prompts</span>
                </h1>

                {/* Subtitle - Adjusted size and padding */}
                <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-slate-200 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
                  Stop struggling with prompt engineering. Our AI-powered tool turns your rough ideas into
                  <span className="text-amber-400 font-semibold"> high-quality, ready-to-use prompts</span> that get
                  better results from any AI model.
                </p>
              </div>

              {/* Buttons - Already responsive, but adjusted padding */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
                <div onClick={onStart} className="cursor-pointer">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0"
                  >
                    Start Creating Prompts
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToExamples}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <Star className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  See Examples
                </Button>
              </div>

              {/* Stats - Already responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-16 max-w-5xl mx-auto px-4 sm:px-0">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`text-center transform transition-all duration-700 delay-${index * 200} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                  >
                    <div className="flex justify-center mb-2 sm:mb-3 text-amber-400">{stat.icon}</div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                      {stat.number}
                    </div>
                    <p className="text-slate-300 text-base sm:text-lg">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Adjusted position */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
          <ChevronDown className="h-5 w-5 sm:h-8 sm:w-8 text-white/60" />
        </div>
      </section>

      {/* Before/After Example Section - Add ref here */}
      <section 
        ref={examplesRef}
        className="relative w-full min-h-screen flex items-center justify-center py-12 sm:py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 z-20"
      >
        {/* Gradient overlay for smooth transition */}
        <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-purple-900/20 to-transparent"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
              See the{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Watch how we transform vague ideas into precise, effective prompts
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <Tabs value={activeExample} onValueChange={setActiveExample} className="w-full">
              <TabsList className="grid w-full max-w-sm sm:max-w-md mx-auto grid-cols-2 mb-8 sm:mb-12 h-12 sm:h-14 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger
                  value="before"
                  className="text-base sm:text-lg font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                >
                  Before
                </TabsTrigger>
                <TabsTrigger
                  value="after"
                  className="text-base sm:text-lg font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                >
                  After
                </TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="mt-0">
                <Card className="border-red-200 dark:border-red-800 shadow-xl transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-red-600 dark:text-red-400 flex items-center text-xl sm:text-2xl">
                      <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mr-3 sm:mr-4 animate-pulse"></span>
                      Your Original Thought
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6 sm:pb-8">
                    <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 italic mb-4 sm:mb-6">
                      "{exampleBefore}"
                    </p>
                    <div className="space-y-2 text-base sm:text-lg text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-3">❌</span>
                        Vague and unclear
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-3">❌</span>
                        Missing important details
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-3">❌</span>
                        Won't produce consistent results
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="after" className="mt-0">
                <Card className="border-emerald-200 dark:border-emerald-800 shadow-xl transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-emerald-600 dark:text-emerald-400 flex items-center text-xl sm:text-2xl">
                      <span className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full mr-3 sm:mr-4 animate-pulse"></span>
                      Engineered Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6 sm:pb-8">
                    <pre className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 overflow-x-auto border border-slate-200 dark:border-slate-700">
                      {exampleAfter}
                    </pre>
                    <div className="space-y-2 text-base sm:text-lg text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <span className="text-emerald-500 mr-3">✅</span>
                        Clear structure and requirements
                      </div>
                      <div className="flex items-center">
                        <span className="text-emerald-500 mr-3">✅</span>
                        Specific deliverables outlined
                      </div>
                      <div className="flex items-center">
                        <span className="text-emerald-500 mr-3">✅</span>
                        Tone and style guidance included
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Features Section - Full Viewport */}
      <section className="relative w-full min-h-screen flex items-center justify-center py-12 sm:py-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 z-20">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
              Four{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Powerful Modes
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Choose the right approach for your specific use case and get optimized prompts instantly
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-slate-200 dark:border-slate-700 hover:shadow-xl transform hover:scale-105 transition-all duration-500 group overflow-hidden bg-white dark:bg-slate-800 h-full"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Full Viewport */}
      <section className="relative w-full min-h-screen flex items-center justify-center py-12 sm:py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 z-20">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
                Why Use{" "}
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Prompt Engineer?
                </span>
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 group">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <div className="text-indigo-600 dark:text-indigo-400">{benefit.icon}</div>
                    </div>
                    <p className="text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                      {benefit.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-white dark:bg-slate-800">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                    3-5x
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">Better AI Output Quality</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-white dark:bg-slate-800">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                    Hours
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">Saved on Prompt Iteration</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 sm:col-span-2 bg-white dark:bg-slate-800">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                    50K+
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                    Prompts Successfully Generated
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Viewport */}
      <section className="relative w-full min-h-screen flex items-center justify-center py-12 sm:py-20 lg:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden z-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
            Ready to Create <span className="text-amber-300">Better Prompts?</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-indigo-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of users who are already creating more effective AI prompts. Start transforming your ideas
            today.
          </p>
          <div onClick={onStart} className="cursor-pointer">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto px-10 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-semibold bg-white text-indigo-600 hover:bg-slate-100 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0"
            >
              Get Started for Free
              <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
