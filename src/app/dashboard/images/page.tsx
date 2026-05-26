"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Image as ImageIcon, Video, Star, Trash2, Loader2 } from "lucide-react";

interface BusinessImage {
  id: string;
  image_url: string;
  image_type: 'featured' | 'gallery';
  sort_order: number;
}

interface Business {
  id: string;
  business_name: string;
  listing_id: string;
  plan_key: string;
  max_images: number;
  allows_video: boolean;
}

export default function ImagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [images, setImages] = useState<BusinessImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadImages(selectedBusiness);
    }
  }, [selectedBusiness]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);
    await loadBusinesses(user.id);
  }

  async function loadBusinesses(userId: string) {
    try {
      // Get businesses with their plan info
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select(`
          id,
          business_name,
          owner_profile_id
        `)
        .eq("owner_profile_id", userId);

      if (businessesError) {
        setError("Failed to load businesses");
        setLoading(false);
        return;
      }

      if (!businessesData || businessesData.length === 0) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      // Get listings with plan info
      const businessIds = businessesData.map((b: any) => b.id);
      const { data: listingsData, error: listingsError } = await supabase
        .from("business_listings")
        .select(`
          id,
          business_id,
          listing_status,
          listing_plans:plan_id (
            plan_key,
            max_images,
            allows_video
          )
        `)
        .in("business_id", businessIds);

      if (listingsError) {
        setError("Failed to load listings");
        setLoading(false);
        return;
      }

      // Transform data
      const transformedData = listingsData?.map((item: any) => {
        const business = businessesData.find((b: any) => b.id === item.business_id);
        return {
          id: business?.id,
          business_name: business?.business_name || "Unnamed Business",
          listing_id: item.id,
          plan_key: item.listing_plans?.plan_key || "free",
          max_images: item.listing_plans?.max_images || 0,
          allows_video: item.listing_plans?.allows_video || false,
        };
      }) || [];

      setBusinesses(transformedData);
      if (transformedData.length > 0) {
        setSelectedBusiness(transformedData[0].id);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function loadImages(businessId: string) {
    try {
      const { data, error } = await supabase
        .from("business_images")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error loading images:", error);
        return;
      }

      setImages(data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const business = businesses.find(b => b.id === selectedBusiness);
    if (!business) return;

    // Check image limit
    const currentImageCount = images.filter(img => img.image_type === 'gallery').length;
    const featuredCount = images.filter(img => img.image_type === 'featured').length;
    const totalCount = currentImageCount + featuredCount;

    if (business.plan_key === 'free') {
      setError("Free plans cannot upload images. Please upgrade to Premium or VIP.");
      return;
    }

    if (totalCount >= business.max_images) {
      setError(`You can only upload up to ${business.max_images} images on your ${business.plan_key} plan.`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(files)) {
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedBusiness}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business-gallery')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setError("Failed to upload image");
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('business-gallery')
          .getPublicUrl(fileName);

        // Determine if this should be featured (first image or no featured yet)
        const hasFeatured = images.some(img => img.image_type === 'featured');
        const imageType = !hasFeatured ? 'featured' : 'gallery';

        // Save to database
        const { error: dbError } = await supabase
          .from("business_images")
          .insert({
            business_id: selectedBusiness,
            image_url: publicUrl,
            image_type: imageType,
            sort_order: images.length,
          });

        if (dbError) {
          console.error("Database error:", dbError);
          setError("Failed to save image");
        }
      }

      // Reload images
      await loadImages(selectedBusiness);
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  }

  async function setAsFeatured(imageId: string) {
    try {
      // Remove featured status from all images
      await supabase
        .from("business_images")
        .update({ image_type: 'gallery' })
        .eq("business_id", selectedBusiness)
        .eq("image_type", 'featured');

      // Set selected as featured
      await supabase
        .from("business_images")
        .update({ image_type: 'featured' })
        .eq("id", imageId);

      await loadImages(selectedBusiness);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to set featured image");
    }
  }

  async function deleteImage(imageId: string) {
    try {
      await supabase
        .from("business_images")
        .delete()
        .eq("id", imageId);

      await loadImages(selectedBusiness);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to delete image");
    }
  }

  async function saveVideoUrl() {
    const business = businesses.find(b => b.id === selectedBusiness);
    if (!business || !business.allows_video) {
      setError("Video is only available for VIP plans");
      return;
    }

    // Save video URL to business_listings table
    try {
      await supabase
        .from("business_listings")
        .update({ video_url: videoUrl })
        .eq("id", business.listing_id);

      setError("");
      alert("Video URL saved!");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to save video URL");
    }
  }

  const selectedBusinessObj = businesses.find(b => b.id === selectedBusiness);
  const featuredImage = images.find(img => img.image_type === 'featured');
  const galleryImages = images.filter(img => img.image_type === 'gallery');
  const totalImages = images.length;
  const canUploadMore = selectedBusinessObj && totalImages < selectedBusinessObj.max_images;

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

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <a
            href="/dashboard"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Manage Images & Video
          </h1>
          <p className="text-xl text-white/80">
            Upload photos and videos for your business listing
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#371a5b] mb-2">
              No businesses yet
            </h2>
            <p className="text-gray-500 mb-6">
              Submit a listing to start uploading images
            </p>
            <a
              href="/submit-listing"
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Submit Your First Listing
            </a>
          </div>
        ) : (
          <>
            {/* Business Selector */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.business_name} ({biz.plan_key})
                  </option>
                ))}
              </select>
            </div>

            {selectedBusinessObj && (
              <>
                {/* Plan Info */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#371a5b]">
                        Your Plan: {selectedBusinessObj.plan_key.toUpperCase()}
                      </h2>
                      <p className="text-gray-600">
                        {selectedBusinessObj.max_images === 0 ? (
                          <span className="text-red-600">Free plans cannot upload images</span>
                        ) : (
                          <span>
                            {totalImages} of {selectedBusinessObj.max_images} images used
                            {selectedBusinessObj.allows_video && " • Video allowed"}
                          </span>
                        )}
                      </p>
                    </div>
                    {selectedBusinessObj.plan_key === 'free' && (
                      <a
                        href="/pricing"
                        className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        Upgrade Plan
                      </a>
                    )}
                  </div>
                </div>

                {selectedBusinessObj.plan_key !== 'free' && (
                  <>
                    {/* Featured Image */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-[#ffc107]" />
                        Featured Image
                      </h2>
                      <p className="text-gray-600 mb-4">
                        This image will be displayed on your listing card in the directory and as the hero image on your profile page.
                      </p>
                      
                      {featuredImage ? (
                        <div className="relative">
                          <img
                            src={featuredImage.image_url}
                            alt="Featured"
                            className="w-full max-w-md h-64 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => deleteImage(featuredImage.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No featured image set</p>
                          <p className="text-sm text-gray-400">Upload an image below and set it as featured</p>
                        </div>
                      )}
                    </div>

                    {/* Gallery Images */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                      <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                        Gallery Images
                      </h2>

                      {canUploadMore ? (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#54afe6] transition">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-400">
                              PNG, JPG, GIF up to 5MB each
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              disabled={uploading}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          {uploading && (
                            <p className="text-[#54afe6] mt-2 flex items-center">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                          <p className="text-yellow-700">
                            You have reached your image limit ({selectedBusinessObj.max_images}).
                            <a href="/pricing" className="text-[#371a5b] font-semibold ml-1">
                              Upgrade your plan
                            </a>
                            {" "}for more images.
                          </p>
                        </div>
                      )}

                      {/* Image Grid */}
                      {images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.image_url}
                                alt="Business"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center space-x-2">
                                {image.image_type !== 'featured' && (
                                  <button
                                    onClick={() => setAsFeatured(image.id)}
                                    className="p-2 bg-[#ffc107] text-white rounded-full hover:bg-[#f68712]"
                                    title="Set as featured"
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteImage(image.id)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              {image.image_type === 'featured' && (
                                <div className="absolute top-2 left-2 bg-[#ffc107] text-white text-xs px-2 py-1 rounded-full flex items-center">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
                      )}
                    </div>

                    {/* Video (VIP only) */}
                    {selectedBusinessObj.allows_video && (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-[#371a5b] mb-4 flex items-center">
                          <Video className="w-5 h-5 mr-2" />
                          Video
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Add a YouTube or Vimeo video URL to showcase your business.
                        </p>
                        <div className="flex gap-4">
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                          />
                          <button
                            onClick={saveVideoUrl}
                            className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                          >
                            Save Video
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
