'use client'

import { useEffect, useState } from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Star, Quote } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Testimonial {
  id: string
  author_name: string
  author_title: string | null
  author_company: string | null
  content: string
  rating: number
  is_featured: boolean
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  // supabase client already imported

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching testimonials:', error)
        return
      }

      setTestimonials(data || [])
    } catch (err) {
      console.error('Exception fetching testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-[#ffc107] fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Success Stories
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            See how local businesses are growing with STL Business Guide
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg p-8 relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#54afe6]/20" />
                
                {/* Rating */}
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Text */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Featured Badge */}
                {testimonial.is_featured && (
                  <div className="bg-[#86c540]/10 text-[#86c540] px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block">
                    Featured Success Story
                  </div>
                )}

                {/* Author */}
                <div className="border-t pt-6">
                  <p className="font-bold text-[#371a5b]">{testimonial.author_name}</p>
                  <p className="text-[#54afe6] font-medium">{testimonial.author_company || 'Local Business'}</p>
                  <p className="text-gray-500 text-sm">{testimonial.author_title || 'Business Owner'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No testimonials yet. Check back soon!</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Write Your Success Story?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of local businesses already growing with STL Business Guide
          </p>
          <a
            href="/submit-listing?plan=free"
            className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Get Started Free
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
