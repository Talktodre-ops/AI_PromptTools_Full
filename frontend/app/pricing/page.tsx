"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Github, Coffee, Share2, BookOpen, Zap, Users, Trophy } from "lucide-react"

export default function FreePage() {
  const handleGitHubStar = () => {
    window.open('https://github.com/yourusername/AI_PromptTools_Full', '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'PROMPTHERO - Free AI Prompt Engineering Tool',
        text: 'Check out this amazing free tool for AI prompt engineering!',
        url: window.location.origin
      })
    } else {
      navigator.clipboard.writeText(window.location.origin)
      // You could add a toast notification here
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600">PROMPTHERO</span> is Completely Free!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          No subscriptions, no hidden costs, no limits. Just powerful AI prompt engineering tools for everyone.
        </p>

        {/* Support Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={handleGitHubStar} className="bg-gray-800 hover:bg-gray-700">
            <Github className="w-5 h-5 mr-2" />
            Star on GitHub
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="w-5 h-5 mr-2" />
            Share with Friends
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          💝 Built with love by <strong>Your Name</strong> • Show support by starring the project!
        </div>
      </div>

      {/* What You Get - Free Features */}
      <div className="grid md:grid-cols-1 gap-8 mb-16 max-w-4xl mx-auto">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600 text-white">100% FREE FOREVER</Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              Everything Included
            </CardTitle>
            <p className="text-green-700">
              All features, no restrictions, forever free
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Core Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Unlimited prompt generations
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    All prompt modes (Basic, Quick, Deep, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Video prompt generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Image-to-prompt conversion
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Prompt gallery & marketplace
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Advanced Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Save & organize prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Share prompts with community
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Analytics & insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Export & download prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    No watermarks or restrictions
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why Free? */}
      <div className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Why is PROMPTHERO Free?</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Built with Passion</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm">
              <p className="text-gray-600">
                Created as a labor of love to help the AI community. No profit motive, just genuine desire to help others succeed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Community First</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm">
              <p className="text-gray-600">
                AI tools should be accessible to everyone, not just those who can afford expensive subscriptions. Knowledge should be free.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Portfolio Project</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm">
              <p className="text-gray-600">
                This is a milestone project to showcase skills and give back to the community. Your stars and shares are the best reward!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How to Support */}
      <div className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">How You Can Support This Project</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-6 h-6" />
                Star on GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                The best way to support this project! GitHub stars help others discover the tool and motivate continued development.
              </p>
              <Button onClick={handleGitHubStar} className="w-full bg-gray-800 hover:bg-gray-700">
                <Star className="w-4 h-4 mr-2" />
                Give it a star ⭐
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-6 h-6" />
                Spread the Word
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Share PROMPTHERO with friends, on social media, or in your communities. Help others discover this free tool!
              </p>
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share with others
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Amazing Prompts?</h2>
        <p className="text-lg mb-6">
          Start using PROMPTHERO completely free - no sign-up required, no credit card needed!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = '/'}>
            <Zap className="w-5 h-5 mr-2" />
            Start Creating Now
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = '/gallery'}>
            <BookOpen className="w-5 h-5 mr-2" />
            Browse Gallery
          </Button>
        </div>

        <div className="mt-6 text-sm opacity-90">
          ❤️ Made with love by Your Name • Star the project to show support!
        </div>
      </div>
    </div>
  )
}