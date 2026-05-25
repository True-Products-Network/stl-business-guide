'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const emails = [
  {
    id: 1,
    name: 'Welcome Email (Day 0)',
    subject: 'Welcome to STL Business Guide! 🎉 Your listing is live',
    content: `Hi [First Name],

Welcome to the STL Business Guide! Your free business listing is now live and searchable.

Here's what you get with your free listing:
✓ Business name and contact info
✓ Basic description
✓ Standard search placement
✓ Phone & email display

But here's the thing... you're competing with businesses that have Premium and VIP listings. They get:
• Priority placement in search results
• Up to 10 photos + videos
• Featured on the homepage
• Banner ad placements
• Customer reviews displayed

See the difference → [LINK TO PRICING PAGE]

Questions? Just reply to this email.

Best,
Nigel Lear
True Products Network`,
  },
  {
    id: 2,
    name: 'Success Stories (Day 2)',
    subject: "How Sarah's Salon Got 47 New Clients in 30 Days",
    content: `Hi [First Name],

I wanted to share a quick success story...

Sarah owns a hair salon in Chesterfield. She started with a free listing like yours, but wasn't getting many calls.

She upgraded to Premium. Within 30 days:
• 47 new client inquiries
• 12 became regular customers
• ROI: 380% in the first month

"The priority placement made all the difference. Now I'm on page 1 when people search 'hair salon Chesterfield'." - Sarah

Your business could be next.

Upgrade to Premium → [LINK TO PRICING PAGE]

Talk soon,
Nigel`,
  },
  {
    id: 3,
    name: 'Feature Comparison (Day 4)',
    subject: "What you're missing (and it's costing you customers)",
    content: `Hi [First Name],

I took a look at your free listing. It's good, but you're missing key features that drive leads:

YOUR FREE LISTING:
✗ Buried on page 3+ of search results
✗ No photos to showcase your work
✗ No website link
✗ No customer reviews visible
✗ No social media links

PREMIUM LISTINGS GET:
✓ Priority placement (page 1)
✓ 5 photos to show your business
✓ Website link (drives traffic)
✓ Customer reviews (builds trust)
✓ Social media links
✓ Business hours

VIP LISTINGS GET EVERYTHING PLUS:
✓ Homepage featured placement
✓ 10 photos + 1 video
✓ Banner ad placement
✓ Coupon/deal listing
✓ Analytics dashboard
✓ Priority support

Every day you're not visible is a day your competitors get the call.

See pricing and upgrade → [LINK TO PRICING PAGE]

Best,
Nigel`,
  },
  {
    id: 4,
    name: 'Special Offer (Day 7)',
    subject: '20% off your first month (expires Friday)',
    content: `Hi [First Name],

Quick question: What's holding you back from upgrading your listing?

I get it. Every dollar matters when you're running a business.

So here's what I'm going to do...

For the next 48 hours, get 20% OFF your first month:
• Premium: $97 → $77 (save $20)
• VIP: $497 → $397 (save $100)

Use code: UPGRADE20

This expires Friday at midnight.

Why upgrade now?
1. Summer is peak season for local searches
2. Your competitors are already advertising
3. One new customer pays for the whole year

Claim your discount → [LINK TO PRICING PAGE WITH ?coupon=UPGRADE20]

Questions? Call me directly: [YOUR PHONE]

Nigel Lear
True Products Network

P.S. This discount is only for free listing members like you. Don't share it 😉`,
  },
  {
    id: 5,
    name: 'FAQ (Day 10)',
    subject: 'Premium vs VIP: Which should you choose?',
    content: `Hi [First Name],

I get a lot of questions about Premium vs VIP. Here's the breakdown:

Q: What's the main difference?
A: Premium gets you priority search placement and enhanced features. VIP gets you homepage featured placement and maximum exposure.

Q: Is there a contract?
A: No! Cancel anytime. But most businesses stay because it works.

Q: How fast will I see results?
A: Most businesses see increased visibility within 48 hours of upgrade. New leads typically start within 1-2 weeks.

Q: Can I switch plans later?
A: Absolutely. Start with Premium, upgrade to VIP anytime.

Q: What if I don't get results?
A: I'll personally review your listing and help optimize it. Your success is my success.

Q: How do I get started?
A: Click below, choose your plan, and your upgraded listing goes live immediately.

Still have questions? Reply to this email or book a quick call: [CALENDLY LINK]

Upgrade now → [LINK TO PRICING PAGE]

Best,
Nigel`,
  },
  {
    id: 6,
    name: 'Final Call (Day 14)',
    subject: "Last call: Let's talk about growing [Business Name]",
    content: `Hi [First Name],

This is my last email in this series. I don't want to clutter your inbox.

But I also don't want you to miss out on potential customers.

Here's the truth:
• Your free listing is live ✓
• But it's not getting the visibility it deserves
• Your competitors with Premium/VIP listings are getting the calls
• Summer is the busiest season for local business searches

You have 3 options:

1. DO NOTHING - Keep your free listing and hope for the best

2. UPGRADE TO PREMIUM ($97/mo) - Get priority placement, photos, reviews, and start getting found

3. GO VIP ($497/mo) - Get maximum exposure, homepage features, and become THE choice in your category

I've helped dozens of businesses grow with better visibility. I can help you too.

Book a 15-minute call with me → [CALENDLY LINK]

Or upgrade directly → [LINK TO PRICING PAGE]

Either way, I wish you success.

Nigel Lear
True Products Network
(636) 555-0123

P.S. If you're not ready now, I get it. Your free listing stays active. But when you're ready to grow, you know where to find me.`,
  },
];

const smsMessages = [
  {
    id: 'sms1',
    name: 'SMS Follow-up 1 (Day 3)',
    content: "Hi [First Name]! Nigel here from STL Business Guide. Saw you claimed your free listing. Quick question: what's your biggest challenge getting new customers right now? -Nigel",
  },
  {
    id: 'sms2',
    name: 'SMS Follow-up 2 (Day 8)',
    content: '[First Name], your 20% off upgrade expires tomorrow. Want to grab it? Link: [SHORT LINK] -Nigel, STL Business Guide',
  },
  {
    id: 'sms3',
    name: 'SMS Final (Day 15)',
    content: "[First Name], last message from me. Your free listing is active. When you're ready to get more visibility, here's the link: [SHORT LINK] -Nigel",
  },
];

export default function EmailPreviewPage() {
  const [selectedEmail, setSelectedEmail] = useState(emails[0]);
  const [activeTab, setActiveTab] = useState<'emails' | 'sms'>('emails');

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">GHL Nurture Campaign Preview</h1>
          <p className="text-white/80">Free Lead → Premium/VIP Conversion Sequence</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'emails'
                ? 'bg-[#371a5b] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Email Sequence (6 emails)
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'sms'
                ? 'bg-[#371a5b] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            SMS Sequence (3 messages)
          </button>
        </div>

        {activeTab === 'emails' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-2">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedEmail.id === email.id
                      ? 'bg-[#371a5b] text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{email.name}</div>
                  <div className={`text-sm mt-1 ${selectedEmail.id === email.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {email.subject}
                  </div>
                </button>
              ))}
            </div>

            {/* Email Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <div className="text-sm text-gray-500 mb-1">Subject:</div>
                  <div className="font-semibold text-lg">{selectedEmail.subject}</div>
                </div>
                
                {/* Email Body */}
                <div className="p-6">
                  <div className="prose max-w-none">
                    {selectedEmail.content.split('\n').map((line, idx) => {
                      if (line.startsWith('•')) {
                        return (
                          <li key={idx} className="ml-4 text-gray-700">
                            {line.replace('•', '').trim()}
                          </li>
                        );
                      }
                      if (line.startsWith('✓') || line.startsWith('✗')) {
                        return (
                          <div key={idx} className="flex items-start gap-2 my-1">
                            <span className={line.startsWith('✓') ? 'text-green-600' : 'text-red-600'}>
                              {line.startsWith('✓') ? '✓' : '✗'}
                            </span>
                            <span className="text-gray-700">{line.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      if (line.includes('→')) {
                        return (
                          <p key={idx} className="my-3">
                            <a href="#" className="text-blue-600 underline hover:text-blue-800">
                              {line}
                            </a>
                          </p>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={idx} />;
                      }
                      return (
                        <p key={idx} className="text-gray-700 my-2 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Copy Button */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedEmail.content);
                      alert('Email content copied to clipboard!');
                    }}
                    className="bg-[#371a5b] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Copy Email Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {smsMessages.map((sms) => (
              <div key={sms.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-[#371a5b]">{sms.name}</h3>
                <div className="bg-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
                  {sms.content}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sms.content);
                    alert('SMS content copied to clipboard!');
                  }}
                  className="mt-4 w-full bg-[#371a5b] text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Copy SMS Content
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6">How to Use in GHL</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Step 1: Create Email Templates</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Go to Marketing → Email Templates</li>
                <li>Click "New Template"</li>
                <li>Copy email content from this page</li>
                <li>Paste into GHL template editor</li>
                <li>Add your branding/logo</li>
                <li>Save template</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Step 2: Build Workflow</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Go to Automation → Workflows</li>
                <li>Create new workflow</li>
                <li>Trigger: Tag "Free Lead" added</li>
                <li>Add email actions with delays</li>
                <li>Add SMS for non-openers</li>
                <li>Activate workflow</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
