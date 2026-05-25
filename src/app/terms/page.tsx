import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Terms of Service
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <p className="text-gray-600 mb-8">
            Last updated: May 25, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using STL Business Guide (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              STL Business Guide is a business directory platform that connects local businesses with customers in the St. Louis area. We offer Free, Premium, and VIP membership plans with varying features and benefits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To use certain features of the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">4. Business Listings</h2>
            <p className="text-gray-600 mb-4">
              When creating a business listing, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Provide accurate and truthful information about your business</li>
              <li>Not create multiple listings for the same business</li>
              <li>Not use misleading or fraudulent information</li>
              <li>Keep your business information up to date</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">5. Subscription and Payments</h2>
            <p className="text-gray-600 mb-4">
              Premium and VIP memberships are billed monthly. By subscribing:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>You authorize us to charge your payment method</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel anytime through your account settings</li>
              <li>No refunds for partial months</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users' access to the Service</li>
              <li>Upload viruses or malicious code</li>
              <li>Scrape or copy content without permission</li>
              <li>Post false or misleading reviews</li>
              <li>Harass, abuse, or harm others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">7. Content and Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of content you submit to the Service. By submitting content, you grant us a license to use, display, and distribute it in connection with the Service. Our website content, logo, and branding are our intellectual property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">8. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-4">
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We are not responsible for the accuracy of business listings or user-generated content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">11. Indemnification</h2>
            <p className="text-gray-600 mb-4">
              You agree to indemnify and hold harmless STL Business Guide and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">12. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by the laws of the State of Missouri, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">13. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> legal@stlbusinessguide.com<br />
              <strong>Address:</strong> Sunbridge Drive, Chesterfield, MO 63017<br />
              <strong>Phone:</strong> (314) 886-8084
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
