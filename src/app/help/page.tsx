'use client'

import { useEffect, useState } from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Search, MessageCircle, FileText, Phone, Mail, ChevronDown, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  is_help_center: boolean
}

const guides = [
  { id: "getting-started", title: "Getting Started", description: "Learn the basics and create your first listing", keywords: ["start", "begin", "first", "account", "signup", "register", "new"] },
  { id: "creating-listing", title: "Creating Your Listing", description: "Step-by-step guide to create a complete business listing", keywords: ["create", "listing", "business", "profile", "add", "submit", "form"] },
  { id: "optimizing-profile", title: "Optimizing Your Profile", description: "Tips to make your listing stand out and get more views", keywords: ["optimize", "improve", "better", "stand out", "tips", "best practices", "seo"] },
  { id: "managing-photos", title: "Managing Photos & Media", description: "How to upload and showcase your business with images", keywords: ["photos", "images", "upload", "pictures", "media", "gallery", "logo"] },
  { id: "understanding-analytics", title: "Understanding Analytics", description: "Learn to read your dashboard and use data to grow", keywords: ["analytics", "stats", "dashboard", "metrics", "views", "clicks", "data"] },
  { id: "upgrade-plan", title: "Upgrading Your Plan", description: "Compare plans and upgrade for more features", keywords: ["upgrade", "premium", "vip", "plan", "pricing", "payment", "features"] }
]

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_help_center', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(10)

      if (error) {
        console.error('Error fetching FAQs:', error)
        return
      }

      setFaqs(data || [])
    } catch (err) {
      console.error('Exception fetching FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const hasSearchResults = searchQuery && (filteredFaqs.length > 0 || filteredGuides.length > 0)
  const noResults = searchQuery && filteredFaqs.length === 0 && filteredGuides.length === 0

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Help Center
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center">
          <Search className="w-6 h-6 text-gray-400 ml-4" />
          <input
            type="text"
            placeholder="Search FAQs and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 outline-none text-gray-700"
          />
          <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold">
            Search
          </button>
        </div>
      </div>

      {/* Quick Links - Hide when searching */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <a href="#faq" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
              <MessageCircle className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#371a5b] mb-2">FAQs</h3>
              <p className="text-gray-600">Browse common questions and answers</p>
            </a>
            <a href="#contact" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
              <Phone className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#371a5b] mb-2">Contact Us</h3>
              <p className="text-gray-600">Get in touch with our support team</p>
            </a>
            <Link href="/guides" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center block">
              <FileText className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#371a5b] mb-2">Guides</h3>
              <p className="text-gray-600">Step-by-step tutorials and resources</p>
            </Link>
          </div>

          {/* FAQs */}
          <div id="faq" className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#371a5b] mb-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                        <span className="font-semibold text-[#371a5b]">{faq.question}</span>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition" />
                      </summary>
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No FAQs available yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearchResults && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6">
            Search Results for "{searchQuery}"
          </h2>

          {/* Matching Guides */}
          {filteredGuides.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#54afe6]" />
                Guides ({filteredGuides.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredGuides.map((guide) => (
                  <Link key={guide.id} href={`/guides/${guide.id}`}>
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h4 className="font-bold text-[#371a5b] mb-2">{guide.title}</h4>
                      <p className="text-gray-600 text-sm">{guide.description}</p>
                      <div className="mt-3 flex items-center text-[#54afe6] text-sm font-medium">
                        Read Guide <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching FAQs */}
          {filteredFaqs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#54afe6]" />
                FAQs ({filteredFaqs.length})
              </h3>
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                        <span className="font-semibold text-[#371a5b]">{faq.question}</span>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition" />
                      </summary>
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {noResults && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Try different keywords or browse our guides and FAQs below.</p>
            <div className="flex justify-center gap-4">
              <Link href="/guides">
                <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold">
                  Browse All Guides
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section - Show when not searching or at bottom */}
      <div id="contact" className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Still Need Help?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Phone Support - Clickable */}
            <a 
              href="tel:+13148868084" 
              className="flex items-center space-x-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#54afe6]/20 transition-colors">
                <Phone className="w-6 h-6 text-[#54afe6]" />
              </div>
              <div>
                <p className="font-semibold text-[#371a5b]">Phone Support</p>
                <p className="text-gray-600 group-hover:text-[#54afe6] transition-colors">(314) 886-8084</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm CST</p>
              </div>
            </a>
            
            {/* Email Support - Clickable */}
            <a 
              href="mailto:support@stlbusinessguide.com?subject=Support%20Request%20from%20STL%20Business%20Guide&body=Hello%20STL%20Business%20Guide%20Support%2C%0A%0AI%20need%20help%20with%3A%0A%0A" 
              className="flex items-center space-x-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#54afe6]/20 transition-colors">
                <Mail className="w-6 h-6 text-[#54afe6]" />
              </div>
              <div>
                <p className="font-semibold text-[#371a5b]">Email Support</p>
                <p className="text-gray-600 group-hover:text-[#54afe6] transition-colors">support@stlbusinessguide.com</p>
                <p className="text-sm text-gray-500">24-48 hour response</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
