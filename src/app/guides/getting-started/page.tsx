'use client'

import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, ArrowRight, CheckCircle, UserPlus, Building2, Rocket } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up with your email and create a secure password. Verify your email to activate your account.",
    icon: UserPlus,
    details: [
      "Click 'List Your Business' on the homepage",
      "Enter your email address",
      "Create a strong password (8+ characters)",
      "Check your email for verification link",
      "Click the link to verify your account"
    ]
  },
  {
    number: 2,
    title: "Enter Business Information",
    description: "Fill in your business details including name, contact info, and description.",
    icon: Building2,
    details: [
      "Enter your business name",
      "Add your phone number and email",
      "Write a compelling description (100-500 words)",
      "Select your business category",
      "Add your business address"
    ]
  },
  {
    number: 3,
    title: "Submit for Review",
    description: "Choose your plan and submit your listing. Our team will review and approve it within 24-48 hours.",
    icon: Rocket,
    details: [
      "Choose your plan (Free, Premium, or VIP)",
      "Review all information for accuracy",
      "Submit your listing",
      "Wait for approval email (24-48 hours)",
      "Start managing your listing!"
    ]
  }
]

export default function GettingStartedGuide() {
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
            Getting Started
          </h1>
          <p className="text-xl text-white/80">
            Learn the basics of STL Business Guide and how to create your first listing
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>3 steps</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Guide Progress</span>
            <span className="text-sm font-medium text-[#371a5b]">3 Steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Step Header */}
                <div className="bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#371a5b]">{step.title}</h2>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    <Icon className="w-8 h-8 text-[#54afe6] ml-auto hidden md:block" />
                  </div>
                </div>

                {/* Step Details */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-700 mb-4">What you'll do:</h3>
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#86c540] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Diagram */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500 text-center mb-4">Visual Guide</p>
                    <div className="flex items-center justify-center gap-4">
                      {step.number === 1 && (
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-[#54afe6]" />
                          </div>
                          <ArrowRight className="w-6 h-6 text-gray-400" />
                          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-[#86c540]" />
                          </div>
                        </div>
                      )}
                      {step.number === 2 && (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#371a5b]">Info</div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#371a5b]">Contact</div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#371a5b]">Desc</div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#371a5b]">Cat</div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#371a5b]">Addr</div>
                        </div>
                      )}
                      {step.number === 3 && (
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <span className="text-2xl font-bold text-[#ffc107]">Free</span>
                          </div>
                          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <span className="text-2xl font-bold text-[#54afe6]">$$</span>
                          </div>
                          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <span className="text-2xl font-bold text-[#bb7ce4]">$$$</span>
                          </div>
                          <ArrowRight className="w-6 h-6 text-gray-400" />
                          <div className="w-16 h-16 bg-[#86c540] rounded-xl shadow-md flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-[#86c540]/10 to-[#54afe6]/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-4">Next Steps</h2>
          <p className="text-gray-600 mb-6">
            Now that you understand the basics, learn how to create a complete listing that attracts customers.
          </p>
          <Link href="/guides/creating-listing">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Next: Creating Your Listing <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
