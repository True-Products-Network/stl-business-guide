"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  read_time: string;
  featured_image_url: string | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        setError("Blog post not found");
      } else {
        setPost(data);
        // Increment view count
        await supabase
          .from('blog_posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }
    } catch (err) {
      console.error('Error:', err);
      setError("An error occurred");
    }
    setLoading(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#54afe6]"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#371a5b] mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <a
            href="/blog"
            className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header with Featured Image */}
      <div className="relative bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        {/* Background Image */}
        {post.featured_image_url && (
          <div className="absolute inset-0">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#371a5b] via-[#371a5b]/80 to-transparent"></div>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4">
          {/* Back Link */}
          <a
            href="/blog"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </a>

          <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
            {post.category}
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {post.title}
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {post.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {post.read_time}
            </span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Content */}
        <div 
          className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-8 bg-[#54afe6]/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#371a5b] mb-2">
            Ready to Grow Your Business?
          </h3>
          <p className="text-gray-600 mb-4">
            List your business on STL Business Guide and reach thousands of
            local customers.
          </p>
          <a
            href="/submit-listing?plan=free"
            className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Get Started Free
          </a>
        </div>
      </article>

      <Footer />
    </main>
  );
}
