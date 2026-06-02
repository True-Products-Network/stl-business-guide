'use client'

import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, ArrowRight, CheckCircle, Camera, Image, Upload, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    number: 1,
    title: "Photo Requirements",
    description: "Make sure your photos meet these standards for best results.",
    icon: Camera,
    items: [
      { label: "Minimum Size", value: "800 x 600 pixels" },
      { label: "Maximum Size", value: "10 MB per file" },
      { label: "Formats Accepted", value: "JPG, PNG, WebP" },
      { label: "Aspect Ratio", value: "4:3 or 16:9 recommended" },
      { label: "Quality", value: "High resolution, not blurry" }
    ]
  },
  {
    number: 2,
    title: "Types of Photos to Upload",
    description: "Showcase different aspects of your business.",
    icon: Image,
    items: [
      { label: "Business Logo", value: "Your official logo (square format)" },
      { label: "Storefront/Exterior", value: "Help customers find you" },
      { label: "Interior/Workspace", value: "Show your environment" },
      { label: "Products/Services", value: "What you offer" },
      { label: "Team Photos", value: "Build trust with faces" },
      { label: "Before/After", value: "Show results (if applicable)" }
    ]
  },
  {
    number: 3,
    title: "How to Upload",
    description: "Step-by-step instructions for adding photos.",
    icon: Upload,
    steps: [
      "Log into your Business Owner Dashboard",
      "Click 'Edit Business' from the menu",
      "Scroll to the 'Photos' section",
      "Click 'Add Photo' or drag and drop files",
      "Wait for upload to complete",
      "Arrange photos in your preferred order",
      "Click 'Save Changes'"
    ]
  },
  {
    number: 4,
    title: "Best Practices",
    description: "Tips for photos that convert visitors to customers.",
    icon: Eye,
    tips: [
      "Use natural lighting when possible",
      "Keep photos current and up-to-date",
      "Show real photos, not stock images",
      "Include people using your products/services",
      "Update seasonally (holiday decorations, etc.)",
      "Make sure your logo is clearly visible"
    ]
  }
]

export default function ManagingPhotosGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#bb7ce4] to-[#e36087] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/guides" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Managing Photos & Media
          </h1>
          <p className="text-xl text-white/80">
            How to upload, organize, and showcase your business with high-quality images
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>4 sections</span>
            <span>•</span>
            <span>6 min read</span>
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#bb7ce4] to-[#e36087] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {section.number}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-2">{section.title}</h2>
                      <p className="text-gray-600 mb-4">{section.description}</p>
                      
                      {section.items && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="grid gap-3">
                            {section.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="font-medium text-gray-700">{item.label}</span>
                                <span className="text-gray-600">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {section.steps && (
                        <div className="bg-gradient-to-r from-[#bb7ce4]/10 to-[#e36087]/10 rounded-xl p-4">
                          <ol className="space-y-2">
                            {section.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="w-6 h-6 rounded-full bg-[#bb7ce4] text-white text-xs flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {section.tips && (
                        <div className="bg-gradient-to-r from-[#86c540]/10 to-[#54afe6]/10 rounded-xl p-4">
                          <ul className="space-y-2">
                            {section.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-[#86c540] flex-shrink-0 mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Warning Box */}
        <div className="mt-12 bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Only upload photos you have rights to use</li>
                <li>• Avoid photos with watermarks from other websites</li>
                <li>• Don't include personal information in photos (credit cards, IDs)</li>
                <li>• Photos may be reviewed before appearing on your listing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/guides/optimizing-profile">
            <button className="text-gray-600 hover:text-[#371a5b] font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
          </Link>
          <Link href="/guides/understanding-analytics">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Next: Understanding Analytics <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
