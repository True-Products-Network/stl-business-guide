'use client'

import { useState } from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { BookOpen, Search, FileText, Video, HelpCircle, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const guides = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of STL Business Guide and how to create your first listing.",
    icon: BookOpen,
    color: "from-[#54afe6] to-[#371a5b]",
    steps: 3,
    time: "5 min read",
    keywords: ["start", "begin", "first", "account", "signup", "register", "new"]
  },
  {
    id: "creating-listing",
    title: "Creating Your Listing",
    description: "Step-by-step guide to create a complete business listing that attracts customers.",
    icon: FileText,
    color: "from-[#86c540] to-[#54afe6]",
    steps: 5,
    time: "10 min read",
    keywords: ["create", "listing", "business", "profile", "add", "submit", "form"]
  },
  {
    id: "optimizing-profile",
    title: "Optimizing Your Profile",
    description: "Tips and best practices to make your listing stand out and get more views.",
    icon: CheckCircle,
    color: "from-[#ffc107] to-[#f68712]",
    steps: 4,
    time: "8 min read",
    keywords: ["optimize", "improve", "better", "stand out", "tips", "best practices", "seo"]
  },
  {
    id: "managing-photos",
    title: "Managing Photos & Media",
    description: "How to upload, organize, and showcase your business with high-quality images.",
    icon: Video,
    color: "from-[#bb7ce4] to-[#e36087]",
    steps: 4,
    time: "6 min read",
    keywords: ["photos", "images", "upload", "pictures", "media", "gallery", "logo"]
  },
  {
    id: "understanding-analytics",
    title: "Understanding Analytics",
    description: "Learn how to read your dashboard and use data to grow your business.",
    icon: BookOpen,
    color: "from-[#371a5b] to-[#bb7ce4]",
    steps: 4,
    time: "7 min read",
    keywords: ["analytics", "stats", "dashboard", "metrics", "views", "clicks", "data"]
  },
  {
    id: "upgrade-plan",
    title: "Upgrading Your Plan",
    description: "Compare plans and learn how to upgrade for more features and visibility.",
    icon: CheckCircle,
    color: "from-[#f68712] to-[#ffc107]",
    steps: 3,
    time: "5 min read",
    keywords: ["upgrade", "premium", "vip", "plan", "pricing", "payment", "features"]
  }
]

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            User Guides
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Step-by-step tutorials to help you get the most out of STL Business Guide
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center">
          <Search className="w-6 h-6 text-gray-400 ml-4" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Guides Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => {
            const Icon = guide.icon
            return (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#371a5b] mb-2">{guide.title}</h3>
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{guide.steps} steps</span>
                    <span>{guide.time}</span>
                  </div>
                  <div className="mt-4 flex items-center text-[#54afe6] font-medium">
                    Read Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No guides found matching your search.</p>
          </div>
        )}
      </div>

      {/* Need Help Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-4 text-center">
            Can't Find What You Need?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Our support team is here to help you with any questions.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/help">
              <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Visit Help Center
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
