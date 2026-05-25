import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "10 Local Marketing Tips for Small Businesses",
    excerpt: "Learn proven strategies to help your local business thrive and attract more customers.",
    author: "Nigel Lear",
    date: "May 20, 2026",
    category: "Marketing",
    readTime: "5 min read",
    slug: "marketing-tips",
  },
  {
    title: "Local SEO Guide for Small Businesses",
    excerpt: "Complete guide to optimizing your online presence and ranking higher in local search results.",
    author: "Nigel Lear",
    date: "May 15, 2026",
    category: "SEO",
    readTime: "6 min read",
    slug: "seo-guide",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Business Blog
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Tips, strategies, and insights to help your local business thrive
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Placeholder Image */}
              <div className="h-48 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] flex items-center justify-center">
                <span className="text-white text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                {/* Category */}
                <span className="inline-block bg-[#54afe6]/10 text-[#54afe6] px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {post.category}
                </span>

                {/* Title */}
                <h2 className="text-xl font-bold text-[#371a5b] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {post.date}
                  </span>
                </div>

                {/* Read More */}
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-[#54afe6] font-semibold hover:text-[#371a5b] transition"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
