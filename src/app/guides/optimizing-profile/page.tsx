'use client'

import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, ArrowRight, CheckCircle, Star, Camera, FileText, MapPin, Award } from "lucide-react"
import Link from "next/link"

const tips = [
  {
    number: 1,
    title: "Write a Compelling Description",
    description: "Your description is the first thing potential customers read. Make it count!",
    icon: FileText,
    points: [
      "Start with what makes you unique",
      "Include relevant keywords (SEO-friendly)",
      "Mention years of experience",
      "List your specialties or services",
      "Add a call-to-action (Call us today!)",
      "Keep it between 150-300 words"
    ]
  },
  {
    number: 2,
    title: "Upload High-Quality Photos",
    description: "Visuals build trust. Show customers what to expect.",
    icon: Camera,
    points: [
      "Use your logo as the main image",
      "Add photos of your storefront/workspace",
      "Show your team in action",
      "Include before/after photos if applicable",
      "Upload product or service photos",
      "Ensure images are at least 800px wide"
    ]
  },
  {
    number: 3,
    title: "Complete All Fields",
    description: "A complete profile ranks higher in search results.",
    icon: CheckCircle,
    points: [
      "Fill in business hours",
      "Add all contact methods",
      "Include social media links",
      "Select all relevant categories",
      "Add your service area",
      "Verify your address is correct"
    ]
  },
  {
    number: 4,
    title: "Collect Reviews",
    description: "Reviews build credibility and improve your ranking.",
    icon: Star,
    points: [
      "Ask satisfied customers to leave reviews",
      "Respond to all reviews (good and bad)",
      "Share your listing on social media",
      "Add the review link to your email signature",
      "Display reviews on your website",
      "Aim for at least 10 reviews to start"
    ]
  }
]

export default function OptimizingProfileGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/guides" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Optimizing Your Profile
          </h1>
          <p className="text-xl text-white/80">
            Tips and best practices to make your listing stand out and get more views
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>4 tips</span>
            <span>•</span>
            <span>8 min read</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {tips.map((tip) => {
            const Icon = tip.icon
            return (
              <div key={tip.number} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffc107] to-[#f68712] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {tip.number}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-2">{tip.title}</h2>
                      <p className="text-gray-600 mb-4">{tip.description}</p>
                      
                      <div className="bg-gradient-to-r from-[#ffc107]/10 to-[#f68712]/10 rounded-xl p-4">
                        <ul className="space-y-2">
                          {tip.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-[#ffc107] flex-shrink-0 mt-0.5" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pro Tips Box */}
        <div className="mt-12 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-[#ffc107]" />
            <h2 className="text-2xl font-bold">Pro Tips</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#ffc107] font-bold">1.</span>
              <span>Update your listing monthly with new photos or information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ffc107] font-bold">2.</span>
              <span>Use the same business name across all online platforms for consistency</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ffc107] font-bold">3.</span>
              <span>Premium and VIP listings get priority placement in search results</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ffc107] font-bold">4.</span>
              <span>Add seasonal updates (holiday hours, special offers) to stay relevant</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/guides/creating-listing">
            <button className="text-gray-600 hover:text-[#371a5b] font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
          </Link>
          <Link href="/guides/managing-photos">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Next: Managing Photos & Media <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
