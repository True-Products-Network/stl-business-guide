import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Newsletter
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get the latest local business news, exclusive deals, and updates delivered to your inbox
          </p>
        </div>
      </div>

      {/* Newsletter Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-2">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600">
              Join 5,000+ subscribers getting weekly local deals and business updates
            </p>
          </div>

          {/* GHL Embedded Form */}
          <iframe
            src="https://link.leadprospectrr.com/widget/form/5e01wgF05YFBhAevtaLC"
            style={{
              width: "100%",
              height: "921px",
              border: "none",
              borderRadius: "25px",
            }}
            id="inline-5e01wgF05YFBhAevtaLC"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Subscribe to Our Newsletter"
            data-height="921"
            data-layout-iframe-id="inline-5e01wgF05YFBhAevtaLC"
            data-form-id="5e01wgF05YFBhAevtaLC"
            title="Subscribe to Our Newsletter"
          />
        </div>

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-[#54afe6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-[#54afe6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-[#371a5b] mb-2">
              Exclusive Deals
            </h3>
            <p className="text-gray-600 text-sm">
              Get special offers and discounts from local VIP businesses
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-[#bb7ce4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-[#bb7ce4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-[#371a5b] mb-2">
              Local News
            </h3>
            <p className="text-gray-600 text-sm">
              Stay updated on new business openings and community events
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-[#ffc107]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-[#ffc107]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-[#371a5b] mb-2">
              Weekly Updates
            </h3>
            <p className="text-gray-600 text-sm">
              Fresh content delivered to your inbox every week
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
