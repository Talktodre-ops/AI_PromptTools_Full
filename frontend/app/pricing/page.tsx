"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Crown, Users, Building2, Sparkles, Zap, Target, Shield, HeadphonesIcon, Rocket } from "lucide-react"
import { PricingTier, FREE_TIER_LIMITS, PRO_TIER_LIMITS, ENTERPRISE_TIER_LIMITS } from "@/lib/utils"

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    features: [
      "5 prompts per day",
      "Basic templates access",
      "Standard prompt modes",
      "Community support",
      "PROMPTHERO watermark"
    ],
    limits: FREE_TIER_LIMITS
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "month",
    features: [
      "100 prompts per day",
      "All premium templates",
      "Video prompt generation",
      "Commercial templates",
      "Analytics dashboard",
      "No watermark",
      "Priority support",
      "Prompt history & favorites",
      "Performance optimization"
    ],
    limits: PRO_TIER_LIMITS,
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "month",
    features: [
      "Unlimited prompts",
      "Team collaboration",
      "Version control",
      "Custom integrations",
      "Advanced analytics",
      "Audit trails",
      "Role-based access",
      "Dedicated support",
      "White-label options",
      "Custom training",
      "API access"
    ],
    limits: ENTERPRISE_TIER_LIMITS
  }
]

const FEATURE_COMPARISON = [
  {
    category: "Usage Limits",
    features: [
      { name: "Daily Prompts", free: "5", pro: "100", enterprise: "Unlimited" },
      { name: "Total Prompts", free: "50", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Video Prompts", free: false, pro: true, enterprise: true },
      { name: "Commercial Templates", free: false, pro: true, enterprise: true }
    ]
  },
  {
    category: "Templates & Features",
    features: [
      { name: "Basic Templates", free: true, pro: true, enterprise: true },
      { name: "Premium Templates", free: false, pro: true, enterprise: true },
      { name: "Tool-Specific Optimization", free: false, pro: true, enterprise: true },
      { name: "Prompt History", free: false, pro: true, enterprise: true },
      { name: "Favorites", free: false, pro: true, enterprise: true }
    ]
  },
  {
    category: "Analytics & Insights",
    features: [
      { name: "Usage Statistics", free: "Basic", pro: "Advanced", enterprise: "Complete" },
      { name: "Performance Analytics", free: false, pro: true, enterprise: true },
      { name: "Success Rate Tracking", free: false, pro: true, enterprise: true },
      { name: "ROI Dashboard", free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: "Collaboration & Enterprise",
    features: [
      { name: "Team Workspaces", free: false, pro: false, enterprise: true },
      { name: "Version Control", free: false, pro: false, enterprise: true },
      { name: "Role-based Access", free: false, pro: false, enterprise: true },
      { name: "Audit Trails", free: false, pro: false, enterprise: true },
      { name: "Custom Integrations", free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: "Support & Branding",
    features: [
      { name: "Community Support", free: true, pro: true, enterprise: true },
      { name: "Priority Support", free: false, pro: true, enterprise: true },
      { name: "Dedicated Support", free: false, pro: false, enterprise: true },
      { name: "Remove Watermark", free: false, pro: true, enterprise: true },
      { name: "White-label Options", free: false, pro: false, enterprise: true }
    ]
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const getDiscountedPrice = (price: number): number => {
    return billingCycle === "yearly" ? Math.floor(price * 0.8) : price
  }

  const handleUpgrade = (tierId: string) => {
    setSelectedTier(tierId)
    // Here you would integrate with your payment processor
    console.log(`Upgrading to ${tierId} tier`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your <span className="text-blue-600">PROMPTHERO</span> Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Scale your AI content creation with the perfect plan for your needs
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={billingCycle === "monthly" ? "font-semibold" : "text-gray-500"}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className={`
              relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500
              ${billingCycle === "yearly" ? "bg-blue-600" : "bg-gray-200"}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                ring-0 transition duration-200 ease-in-out
                ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"}
              `}
            />
          </button>
          <span className={billingCycle === "yearly" ? "font-semibold" : "text-gray-500"}>
            Yearly
          </span>
          {billingCycle === "yearly" && (
            <Badge className="bg-green-100 text-green-700 ml-2">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {PRICING_TIERS.map((tier) => (
          <Card key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                {tier.id === "free" && <Sparkles className="w-6 h-6" />}
                {tier.id === "pro" && <Zap className="w-6 h-6" />}
                {tier.id === "enterprise" && <Building2 className="w-6 h-6" />}
                {tier.name}
              </CardTitle>
              <div className="text-4xl font-bold">
                ${getDiscountedPrice(tier.price)}
                <span className="text-lg font-normal text-gray-500">
                  /{tier.period}
                </span>
              </div>
              {billingCycle === "yearly" && tier.price > 0 && (
                <div className="text-sm text-gray-500 line-through">
                  ${tier.price}/{tier.period}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade(tier.id)}
                className={`w-full ${
                  tier.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                disabled={tier.id === "free"}
              >
                {tier.id === "free" ? "Current Plan" : `Upgrade to ${tier.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Features</th>
                <th className="text-center p-4 font-semibold">Free</th>
                <th className="text-center p-4 font-semibold">Pro</th>
                <th className="text-center p-4 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_COMPARISON.map((category) => (
                <React.Fragment key={category.category}>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="p-4 font-semibold text-gray-700">
                      {category.category}
                    </td>
                  </tr>
                  {category.features.map((feature, index) => (
                    <tr key={`${category.category}-${index}`} className="border-b">
                      <td className="p-4">{feature.name}</td>
                      <td className="text-center p-4">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          feature.free
                        )}
                      </td>
                      <td className="text-center p-4">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          feature.pro
                        )}
                      </td>
                      <td className="text-center p-4">
                        {typeof feature.enterprise === "boolean" ? (
                          feature.enterprise ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          feature.enterprise
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
            <p className="text-gray-600">
              Yes! You can change your plan at any time. Upgrades take effect immediately, while downgrades 
              take effect at the end of your current billing cycle.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">What happens if I exceed my daily limit?</h3>
            <p className="text-gray-600">
              Your prompts will be queued until the next day, or you can upgrade to a higher tier for 
              immediate access. We'll send you notifications when you're approaching your limits.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">
              We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, 
              contact our support team for a full refund.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Is there a free trial for Pro/Enterprise?</h3>
            <p className="text-gray-600">
              Yes! All new users get a 7-day free trial of Pro features. No credit card required to start.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Supercharge Your AI Content?</h2>
        <p className="text-lg mb-6">
          Join thousands of creators and businesses using PROMPTHERO to generate better prompts faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Rocket className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <HeadphonesIcon className="w-5 h-5 mr-2" />
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
} 