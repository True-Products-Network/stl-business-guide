'use client'

import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, ArrowRight, CheckCircle, BarChart3, Eye, MousePointer, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    number: 1,
    title: "Dashboard Overview",
    description: "Your analytics dashboard shows key metrics about your listing performance.",
    icon: BarChart3,
    metrics: [
      { name: "Profile Views", desc: "How many people viewed your listing" },
      { name: "Website Clicks", desc: "Visitors who clicked to your website" },
      { name: "Phone Clicks", desc: "People who tapped to call you" },
      { name: "Email Clicks", desc: "Users who clicked to email you" },
      { name: "Direction Clicks", desc: "People who requested directions" }
    ]
  },
  {
    number: 2,
    title: "Understanding the Numbers",
    description: "What each metric means and why it matters.",
    icon: Eye,
    explanations: [
      { metric: "Profile Views", what: "Total visits to your listing page", why: "Shows overall interest and visibility" },
      { metric: "Engagement Rate", what: "Clicks ÷ Views × 100", why: "Measures how compelling your listing is" },
      { metric: "Contact Rate", what: "(Phone + Email clicks) ÷ Views", why: "Shows conversion to actual leads" },
      { metric: "Website Traffic", what: "Clicks to your website", why: "Drives traffic to your own site" }
    ]
  },
  {
    number: 3,
    title: "Time Periods",
    description: "Compare performance across different time frames.",
    icon: Calendar,
    periods: [
      { period: "Last 7 Days", use: "See recent trends and activity" },
      { period: "Last 30 Days", use: "Monthly performance overview" },
      { period: "Last 90 Days", use: "Quarterly trends and patterns" },
      { period: "All Time", use: "Total lifetime performance" }
    ]
  },
  {
    number: 4,
    title: "Improving Your Metrics",
    description: "Actions you can take to increase engagement.",
    icon: TrendingUp,
    actions: [
      { action: "Low Profile Views?", solution: "Upgrade to Premium/VIP for better placement" },
      { action: "Low Website Clicks?", solution: "Add a compelling call-to-action in your description" },
      { action: "Low Phone Clicks?", solution: "Make your phone number prominent, add business hours" },
      { action: "Low Email Clicks?", solution: "Offer a free consultation or quote in your listing" },
      { action: "Low Direction Clicks?", solution: "Add landmarks in your address description" }
    ]
  }
]

export default function UnderstandingAnalyticsGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/guides" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Understanding Analytics
          </h1>
          <p className="text-xl text-white/80">
            Learn how to read your dashboard and use data to grow your business
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>4 sections</span>
            <span>•</span>
            <span>7 min read</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.number} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#371a5b] to-[#bb7ce4] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {section.number}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-2">{section.title}</h2>
                      <p className="text-gray-600 mb-4">{section.description}</p>
                      
                      {section.metrics && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {section.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <p className="font-medium text-[#371a5b]">{metric.name}</p>
                              <p className="text-sm text-gray-600">{metric.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.explanations && (
                        <div className="space-y-3">
                          {section.explanations.map((item, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-[#371a5b]/5 to-[#bb7ce4]/5 rounded-lg p-4">
                              <p className="font-semibold text-[#371a5b]">{item.metric}</p>
                              <p className="text-sm text-gray-600"><strong>What:</strong> {item.what}</p>
                              <p className="text-sm text-gray-600"><strong>Why:</strong> {item.why}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.periods && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {section.periods.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <Calendar className="w-5 h-5 text-[#54afe6]" />
                              <div>
                                <p className="font-medium text-[#371a5b]">{item.period}</p>
                                <p className="text-sm text-gray-600">{item.use}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.actions && (
                        <div className="space-y-3">
                          {section.actions.map((item, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-[#86c540]/10 to-[#54afe6]/10 rounded-lg p-4">
                              <p className="font-semibold text-[#371a5b]">{item.action}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#86c540]" />
                                {item.solution}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sample Dashboard Preview */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6">Sample Dashboard View</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#54afe6] to-[#371a5b] rounded-xl p-4 text-white text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm opacity-80">Profile Views</p>
            </div>
            <div className="bg-gradient-to-br from-[#86c540] to-[#54afe6] rounded-xl p-4 text-white text-center">
              <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">89</p>
              <p className="text-sm opacity-80">Website Clicks</p>
            </div>
            <div className="bg-gradient-to-br from-[#ffc107] to-[#f68712] rounded-xl p-4 text-white text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">7.2%</p>
              <p className="text-sm opacity-80">Engagement Rate</p>
            </div>
            <div className="bg-gradient-to-br from-[#bb7ce4] to-[#e36087] rounded-xl p-4 text-white text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">+23%</p>
              <p className="text-sm opacity-80">vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/guides/managing-photos">
            <button className="text-gray-600 hover:text-[#371a5b] font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
          </Link>
          <Link href="/guides/upgrade-plan">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Next: Upgrading Your Plan <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
