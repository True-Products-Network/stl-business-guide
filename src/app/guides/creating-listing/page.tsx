'use client'

import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, ArrowRight, CheckCircle, Building2, MapPin, Image, Tag, Send } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: 1,
    title: "Business Name & Description",
    description: "Choose a clear, searchable business name and write a compelling description.",
    icon: Building2,
    tips: [
      "Use your official business name",
      "Include keywords customers search for",
      "Write 2-3 paragraphs about what you do",
      "Mention your unique selling points",
      "Keep it professional but friendly"
    ]
  },
  {
    number: 2,
    title: "Contact Information",
    description: "Add accurate contact details so customers can reach you easily.",
    icon: Building2,
    tips: [
      "Use a business phone you check regularly",
      "Add a professional email address",
      "Include your website if you have one",
      "Double-check for typos",
      "Consider adding business hours"
    ]
  },
  {
    number: 3,
    title: "Location & Service Area",
    description: "Set your business location and define your service area.",
    icon: MapPin,
    tips: [
      "Enter your full street address",
      "Select the correct city and state",
      "Define your service area (how far you travel)",
      "Add landmarks if helpful",
      "Verify the map pin is accurate"
    ]
  },
  {
    number: 4,
    title: "Photos & Media",
    description: "Upload high-quality photos to showcase your business.",
    icon: Image,
    tips: [
      "Upload your logo (square format)",
      "Add photos of your storefront/workspace",
      "Include product/service photos",
      "Show team photos to build trust",
      "Use high-resolution images (min 800px wide)"
    ]
  },
  {
    number: 5,
    title: "Categories & Submit",
    description: "Select relevant categories and submit for review.",
    icon: Tag,
    tips: [
      "Choose 1-3 relevant categories",
      "Be specific (e.g., 'Italian Restaurant' not just 'Restaurant')",
      "Review all information",
      "Select your plan (Free/Premium/VIP)",
      "Click Submit and wait for approval!"
    ]
  }
]

export default function CreatingListingGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#86c540] to-[#54afe6] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/guides" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Creating Your Listing
          </h1>
          <p className="text-xl text-white/80">
            Step-by-step guide to create a complete business listing that attracts customers
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>5 steps</span>
            <span>•</span>
            <span>10 min read</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#86c540] to-[#54afe6] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-2">{step.title}</h2>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#86c540]" /> Best Practices:
                        </h3>
                        <ul className="space-y-2">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-[#86c540] font-bold">•</span>
                              {tip}
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

        {/* Quick Reference Card */}
        <div className="mt-12 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Business name is clear</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Description is detailed</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Contact info is accurate</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Address is complete</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Photos are uploaded</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#86c540]" />
              <span>Categories selected</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/guides/getting-started">
            <button className="text-gray-600 hover:text-[#371a5b] font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
          </Link>
          <Link href="/guides/optimizing-profile">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Next: Optimizing Your Profile <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
