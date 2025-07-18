"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  Clock, 
  Award, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Heart,
  Share2,
  Crown,
  AlertTriangle
} from "lucide-react"
import { UsageTracker, PerformanceAnalytics } from "@/lib/utils"

// Generate analytics data combining usage and performance metrics
const generateAnalyticsData = () => {
  const usageStats = UsageTracker.getUsageStats()
  const performanceMetrics = PerformanceAnalytics.getPerformanceMetrics()
  const today = new Date()
  
  // Generate last 30 days of usage data with real performance data if available
  const dailyUsage = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    
    // Try to find real data first
    const realData = performanceMetrics.trends.dailySuccess.find(d => d.date === dateStr)
    
    return {
      date: dateStr,
      prompts: Math.floor(Math.random() * 15) + 1,
      success: realData ? Math.floor(realData.success / 10) : Math.floor(Math.random() * 12) + 3,
      satisfaction: realData ? realData.success : Math.floor(Math.random() * 30) + 70
    }
  })
  
  // Use real category data if available
  const promptTypes = performanceMetrics.topPerformingCategories.length > 0
    ? performanceMetrics.topPerformingCategories.map((cat, i) => ({
        name: cat.category,
        value: Math.floor(cat.success),
        color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'][i % 5]
      }))
    : [
        { name: 'Content Writing', value: 35, color: '#8884d8' },
        { name: 'Business & Marketing', value: 28, color: '#82ca9d' },
        { name: 'Technical', value: 20, color: '#ffc658' },
        { name: 'Creative', value: 17, color: '#ff7c7c' }
      ]
  
  // Use real mode performance data
  const performanceAnalyticsData = performanceMetrics.topPerformingModes.length > 0
    ? performanceMetrics.topPerformingModes.map(mode => ({
        mode: mode.mode.charAt(0).toUpperCase() + mode.mode.slice(1),
        usage: mode.count,
        satisfaction: Math.floor(mode.success),
        time: Math.random() * 5 + 2 // Mock time data
      }))
    : [
        { mode: 'Quick', usage: 45, satisfaction: 85, time: 2.3 },
        { mode: 'Deep', usage: 30, satisfaction: 92, time: 4.7 },
        { mode: 'Few-Shot', usage: 15, satisfaction: 88, time: 3.2 },
        { mode: 'Chain-of-Thought', usage: 8, satisfaction: 95, time: 6.1 },
        { mode: 'Video', usage: 2, satisfaction: 78, time: 8.5 }
      ]
  
  return {
    usageStats,
    performanceMetrics,
    dailyUsage,
    promptTypes,
    performanceAnalyticsData
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState(generateAnalyticsData())
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  
  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      setData(generateAnalyticsData())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const { usageStats, performanceMetrics, dailyUsage, promptTypes, performanceAnalyticsData } = data
  
  // Calculate metrics - use real performance data when available
  const totalPrompts = performanceMetrics.totalPrompts || dailyUsage.reduce((sum, day) => sum + day.prompts, 0)
  const successRate = performanceMetrics.successRate || 0
  const avgRating = performanceMetrics.avgRating || 0
  const avgSatisfaction = avgRating > 0 ? avgRating * 20 : dailyUsage.reduce((sum, day) => sum + day.satisfaction, 0) / dailyUsage.length
  
  const usagePercentage = UsageTracker.getUsagePercentage()
  const remainingUsage = UsageTracker.getRemainingUsage()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your prompt performance and usage insights</p>
      </div>
      
      {/* Usage Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
            <Progress value={usagePercentage} className="w-12" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.dailyPrompts}</div>
            <p className="text-xs text-gray-600">
              {remainingUsage.daily > 0 ? `${remainingUsage.daily} remaining` : 'Limit reached'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrompts}</div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +2.3% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">Average rating</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Current Plan Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan: {usageStats.userTier.charAt(0).toUpperCase() + usageStats.userTier.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Daily Limit</div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="text-sm mt-1">
                {usageStats.dailyPrompts} / {UsageTracker.getLimitsForTier(usageStats.userTier).dailyPrompts} prompts
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Features Available</div>
              <div className="flex flex-wrap gap-1">
                {usageStats.features.map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Upgrade Benefits</div>
              <Button size="sm" className="w-full">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="prompts" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Prompt Types */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={promptTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {promptTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prompt Mode Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#8884d8" name="Usage Count" />
              <Bar dataKey="satisfaction" fill="#82ca9d" name="Success Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Performance Improvement Suggestions */}
      {performanceMetrics.improvementSuggestions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performing Modes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.topPerformingModes.length > 0 ? (
                performanceMetrics.topPerformingModes
                  .slice(0, 3)
                  .map((mode, index) => (
                    <div key={mode.mode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{mode.mode.charAt(0).toUpperCase() + mode.mode.slice(1)}</div>
                          <div className="text-sm text-gray-600">{mode.success.toFixed(1)}% success rate</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{mode.count} uses</div>
                        <div className="text-sm text-gray-600">Total prompts</div>
                      </div>
                    </div>
                  ))
              ) : (
                performanceAnalyticsData
                  .sort((a, b) => b.satisfaction - a.satisfaction)
                  .slice(0, 3)
                  .map((mode, index) => (
                    <div key={mode.mode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{mode.mode}</div>
                          <div className="text-sm text-gray-600">{mode.satisfaction}% satisfaction</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{mode.usage} uses</div>
                        <div className="text-sm text-gray-600">{mode.time?.toFixed(1)}s avg time</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Optimize Video Prompts</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your video prompt satisfaction is 78%. Try using more specific visual descriptions for better results.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Great Chain-of-Thought Usage</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your CoT prompts have 95% satisfaction! Consider using this mode for complex queries.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Approaching Daily Limit</span>
                </div>
                <p className="text-sm text-gray-600">
                  You've used {usageStats.dailyPrompts} of your daily prompts. Consider upgrading for unlimited access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 