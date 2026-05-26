"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Marketing",
    read_time: "5 min read",
    featured_image_url: "",
    is_published: false,
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "super_admin") {
      setIsAdmin(true);
    } else {
      setError("You don't have permission to access this page");
    }
    setLoading(false);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload image");
      } else {
        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(filePath);
        setFormData({ ...formData, featured_image_url: data.publicUrl });
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred");
    }
    setUploadingImage(false);
  }

  async function handleSubmit(e: React.FormEvent, publish: boolean = false) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from("blog_posts").insert({
        ...formData,
        is_published: publish,
        author_id: user.id,
        published_at: publish ? new Date().toISOString() : null,
      });

      if (error) {
        console.error("Error creating post:", error);
        setError("Failed to create blog post: " + error.message);
      } else {
        router.push("/admin/blog");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#54afe6]" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#371a5b] mb-4">Access Denied</h1>
          <p className="text-gray-600">{error}</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <a
            href="/admin/blog"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog Management
          </a>
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Create New Blog Post
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form className="space-y-8">
          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white">
                {formData.featured_image_url ? (
                  <img
                    src={formData.featured_image_url}
                    alt="Featured"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="featured-image"
                />
                <label
                  htmlFor="featured-image"
                  className="inline-flex items-center bg-[#54afe6] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#54afe6]/90 transition"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ImageIcon className="w-5 h-5 mr-2" />
                  )}
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </label>
                {formData.featured_image_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, featured_image_url: "" })
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
              placeholder="Enter blog post title"
              required
            />
          </div>

          {/* Slug */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                placeholder="url-slug"
                required
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
              placeholder="Brief summary of the post (shown in blog list)"
            />
          </div>

          {/* Category & Read Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
              >
                <option value="Marketing">Marketing</option>
                <option value="SEO">SEO</option>
                <option value="Reviews">Reviews</option>
                <option value="Directories">Directories</option>
                <option value="Social Media">Social Media</option>
                <option value="Analytics">Analytics</option>
                <option value="Business Tips">Business Tips</option>
              </select>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) =>
                  setFormData({ ...formData, read_time: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                placeholder="e.g., 5 min read"
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (HTML) *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6] font-mono text-sm"
              placeholder="<p>Your blog post content in HTML...</p>"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Write your content in HTML format. Use Tailwind classes for styling.
            </p>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-[#371a5b] mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="SEO title (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="SEO description (optional)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Eye className="w-5 h-5 mr-2" />
              )}
              Publish Post
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
