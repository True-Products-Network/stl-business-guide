import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    business: "Sarah's Salon",
    location: "Chesterfield, MO",
    rating: 5,
    text: "Since upgrading to Premium, I've seen a 147% increase in new client inquiries. The priority placement on search results has made all the difference for my business.",
    results: "47 new clients in 30 days",
  },
  {
    name: "Michael Chen",
    business: "Chen's Auto Repair",
    location: "St. Louis, MO",
    rating: 5,
    text: "The VIP membership has been a game-changer. We're now the top result for auto repair in our area, and the dedicated account manager helps us optimize our listing monthly.",
    results: "3x increase in phone calls",
  },
  {
    name: "Jennifer Martinez",
    business: "Martinez Law Firm",
    location: "Clayton, MO",
    rating: 5,
    text: "As a professional services firm, visibility is everything. STL Business Guide has connected us with clients we never would have reached otherwise.",
    results: "12 new retained clients",
  },
  {
    name: "David Thompson",
    business: "Thompson's Landscaping",
    location: "Ballwin, MO",
    rating: 5,
    text: "The photo gallery feature lets us showcase our work beautifully. Potential customers can see our quality before they even call. Worth every penny!",
    results: "85% increase in quote requests",
  },
  {
    name: "Lisa Wong",
    business: "Wong's Kitchen",
    location: "Kirkwood, MO",
    rating: 5,
    text: "Being featured in the newsletter brought us so much traffic! The coupon feature helps us track exactly how many customers come from STL Business Guide.",
    results: "200+ coupon redemptions",
  },
  {
    name: "Robert Taylor",
    business: "Taylor's Fitness Center",
    location: "Wildwood, MO",
    rating: 5,
    text: "The analytics dashboard shows us exactly how people find us. We've used that data to improve our other marketing efforts too.",
    results: "50 new memberships",
  },
];

export default function TestimonialsPage() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#54afe6]/20" />
              
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#ffc107] fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Results Badge */}
              <div className="bg-[#86c540]/10 text-[#86c540] px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block">
                {testimonial.results}
              </div>

              {/* Author */}
              <div className="border-t pt-6">
                <p className="font-bold text-[#371a5b]">{testimonial.name}</p>
                <p className="text-[#54afe6] font-medium">{testimonial.business}</p>
                <p className="text-gray-500 text-sm">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

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
  );
}
