"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  Image as ImageIcon,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string;
  category: string;
  read_time: string;
  featured_image_url: string | null;
  is_published: boolean;
  view_count: number;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Check if user is admin
    console.log("Checking admin for user ID:", user.id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .single();

    console.log("Profile result:", { profile, profileError });

    if (profile?.role === "admin" || profile?.role === "super_admin") {
      setIsAdmin(true);
      await loadPosts();
    } else {
      setError(`You don't have permission to access this page. Your role: ${profile?.role || 'none'}`);
    }
    setLoading(false);
  }

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, author, published_at, category, read_time, featured_image_url, is_published, view_count")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching blog posts:", error);
        setError("Failed to load blog posts");
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post");
      } else {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred");
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) {
        console.error("Error updating post:", error);
        alert("Failed to update post");
      } else {
        setPosts(
          posts.map((p) =>
            p.id === id ? { ...p, is_published: !currentStatus } : p
          )
        );
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="text-gray-600">{error || "You don't have permission to access this page"}</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Blog Management
              </h1>
              <p className="text-xl text-white/80">
                Create, edit, and manage blog posts
              </p>
            </div>
            <a
              href="/admin/blog/new"
              className="inline-flex items-center bg-white text-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Total Posts</p>
            <p className="text-3xl font-bold text-[#371a5b]">{posts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Published</p>
            <p className="text-3xl font-bold text-green-600">
              {posts.filter((p) => p.is_published).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Drafts</p>
            <p className="text-3xl font-bold text-yellow-600">
              {posts.filter((p) => !p.is_published).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Total Views</p>
            <p className="text-3xl font-bold text-[#54afe6]">
              {posts.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Blog Posts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchQuery ? "No posts found matching your search" : "No blog posts yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white text-lg font-bold mr-4">
                            {post.featured_image_url ? (
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#371a5b]">{post.title}</p>
                            <p className="text-sm text-gray-500">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-[#54afe6]/10 text-[#54afe6] px-3 py-1 rounded-full text-sm">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublish(post.id, post.is_published)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.is_published ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(post.published_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.view_count?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-[#54afe6] transition"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <a
                            href={`/admin/blog/edit/${post.id}`}
                            className="p-2 text-gray-400 hover:text-[#371a5b] transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
