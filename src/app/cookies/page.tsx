import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cookie Policy
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            How we use cookies and similar technologies
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <p className="text-gray-600 mb-8">
            Last updated: May 25, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">
              STL Business Guide uses cookies for the following purposes:
            </p>

            <h3 className="text-lg font-semibold text-[#371a5b] mb-2">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
            </p>

            <h3 className="text-lg font-semibold text-[#371a5b] mb-2">Analytics Cookies</h3>
            <p className="text-gray-600 mb-4">
              We use analytics cookies to understand how visitors interact with our website. This helps us improve our website and services. These cookies collect information in an anonymous form.
            </p>

            <h3 className="text-lg font-semibold text-[#371a5b] mb-2">Functionality Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies allow us to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
            </p>

            <h3 className="text-lg font-semibold text-[#371a5b] mb-2">Marketing Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services. These include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Google Analytics (analytics)</li>
              <li>Stripe (payment processing)</li>
              <li>Social media platforms (sharing features)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">4. Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              Most web browsers allow you to control cookies through their settings. You can usually find these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser. You can:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Delete all cookies</li>
              <li>Block all cookies</li>
              <li>Allow all cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close your browser</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Please note that disabling cookies may affect the functionality of our website and prevent you from using certain features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">5. Cookie Consent</h2>
            <p className="text-gray-600 mb-4">
              When you first visit our website, you will see a cookie banner requesting your consent to use non-essential cookies. You can:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You can change your cookie preferences at any time by clicking the &quot;Cookie Settings&quot; link in the footer of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">6. Cookie Duration</h2>
            <p className="text-gray-600 mb-4">
              Cookies can remain on your device for different periods:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> privacy@stlbusinessguide.com<br />
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
