import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Contact Us
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-[#371a5b] mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-8">
              Whether you&apos;re a business owner interested in listing your business,
              or a customer with feedback, we&apos;re here to help.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#54afe6]" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-[#371a5b]">Phone</h3>
                  <p className="text-gray-600">(314) 886-8084</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm CST</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#54afe6]" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-[#371a5b]">Email</h3>
                  <p className="text-gray-600">info@trueproductsnetwork.com</p>
                  <p className="text-sm text-gray-500">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#54afe6]" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-[#371a5b]">Address</h3>
                  <p className="text-gray-600">Chesterfield, MO 63005</p>
                  <p className="text-sm text-gray-500">St. Louis County</p>
                </div>
              </div>
            </div>
          </div>

          {/* GHL Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-full" style={{ height: '634px' }}>
              <iframe
                src="https://link.leadprospectrr.com/widget/form/TCFXwIdc88eaKtFPjO5p"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                id="inline-TCFXwIdc88eaKtFPjO5p"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="ACT | Business Listing | Contact Form"
                data-height="634"
                data-layout-iframe-id="inline-TCFXwIdc88eaKtFPjO5p"
                data-form-id="TCFXwIdc88eaKtFPjO5p"
                title="ACT | Business Listing | Contact Form"
              />
            </div>
          </div>
        </div>
      </div>

      {/* GHL Form Embed Script */}
      <script src="https://link.leadprospectrr.com/js/form_embed.js" async />

      <Footer />
    </main>
  );
}
