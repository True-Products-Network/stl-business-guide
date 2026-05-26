"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  business: [
    { name: "Browse Businesses", href: "/listings" },
    { name: "Add Your Business", href: "/submit-listing?plan=free" },
    { name: "Pricing Plans", href: "/pricing" },
    { name: "Success Stories", href: "/testimonials" },
  ],
  resources: [
    { name: "Marketing Tips", href: "/blog/marketing-tips" },
    { name: "SEO Guide", href: "/blog/seo-guide" },
    { name: "Business Blog", href: "/blog" },
    { name: "Help Center", href: "/help" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Press Kit", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "FB", href: "https://facebook.com/STLBusinessGuide", label: "Facebook" },
  { name: "IG", href: "https://instagram.com/STLBusinessGuide", label: "Instagram" },
  { name: "LI", href: "https://linkedin.com/company/stlbusinessguide", label: "LinkedIn" },
  { name: "TW", href: "https://twitter.com/STLBusinessGuide", label: "Twitter" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#371a5b] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <img 
                src="https://assets.cdn.filesafe.space/Y75D8z0j5aPHXtDyWr3y/media/6a15d683ecd67a415b8e9625.png"
                alt="STL Business Guide"
                className="h-10 w-auto"
              />
              <div>
                <span className="text-xl font-bold">STL Business</span>
                <span className="text-xl font-bold text-[#54afe6]"> Guide</span>
              </div>
            </Link>
            <p className="text-white/70 mb-6 max-w-sm">
              Your ultimate community resource for finding top-rated local businesses, 
              exclusive deals, and premium services in St. Louis.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:314-886-8084" className="flex items-center text-white/70 hover:text-white transition-colors">
                <Phone className="w-5 h-5 mr-3 text-[#54afe6]" />
                (314) 886-8084
              </a>
              <a href="mailto:info@stlbusinessguide.com" className="flex items-center text-white/70 hover:text-white transition-colors">
                <Mail className="w-5 h-5 mr-3 text-[#54afe6]" />
                info@stlbusinessguide.com
              </a>
              <div className="flex items-start text-white/70">
                <MapPin className="w-5 h-5 mr-3 text-[#54afe6] flex-shrink-0 mt-0.5" />
                <span>Sunbridge Drive,<br />Chesterfield, MO 63017</span>
              </div>
            </div>
          </div>

          {/* Business Links */}
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Business</h4>
            <ul className="space-y-3">
              {footerLinks.business.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-white/60 text-sm text-center md:text-left">
              © 2026 STL Business Guide. All rights reserved. | A True Products Network LLC Company
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#54afe6] transition-colors text-sm font-bold"
                  aria-label={social.label}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
