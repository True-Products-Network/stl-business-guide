/**
 * GoHighLevel (GHL) API Integration
 * Sends buyer and lead data to GHL for follow-up and nurture campaigns
 */

// GHL API Configuration
const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';

interface GHLContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ key: string; value: string }>;
  source?: string;
}

/**
 * Create or update a contact in GHL
 */
export async function createOrUpdateGHLContact(contact: GHLContact) {
  try {
    if (!GHL_API_KEY) {
      console.error('GHL_API_KEY not configured');
      return { success: false, error: 'GHL not configured' };
    }

    const response = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        tags: contact.tags || [],
        source: contact.source || 'STL Business Guide',
        customFields: contact.customFields || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('GHL API error:', error);
      return { success: false, error: error.message };
    }

    const data = await response.json();
    console.log('GHL contact created/updated:', data.contact?.id);
    return { success: true, contactId: data.contact?.id };
  } catch (error: any) {
    console.error('GHL integration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add tag to contact in GHL
 */
export async function addTagToGHLContact(email: string, tag: string) {
  try {
    if (!GHL_API_KEY) {
      console.error('GHL_API_KEY not configured');
      return { success: false, error: 'GHL not configured' };
    }

    // First, search for the contact by email
    const searchResponse = await fetch(
      `${GHL_API_BASE}/contacts/lookup?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('GHL search error:', await searchResponse.text());
      return { success: false, error: 'Contact not found' };
    }

    const searchData = await searchResponse.json();
    const contactId = searchData.contacts?.[0]?.id;

    if (!contactId) {
      return { success: false, error: 'Contact not found' };
    }

    // Add tag to contact
    const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [tag] }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('GHL tag error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Tag "${tag}" added to GHL contact:`, contactId);
    return { success: true };
  } catch (error: any) {
    console.error('GHL tag error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle Stripe checkout completion - send PAID buyer to GHL
 */
export async function handleStripeCheckoutForGHL(
  customerEmail: string,
  customerName: string,
  planName: string,
  amount: number
) {
  // Parse name into first/last
  const nameParts = customerName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Create contact in GHL with buyer tags
  const result = await createOrUpdateGHLContact({
    firstName,
    lastName,
    email: customerEmail,
    tags: ['Buyer', `Plan: ${planName}`, 'STL Business Guide', 'Paid Subscriber', 'Hot Lead'],
    source: 'STL Business Guide - Stripe Checkout',
    customFields: [
      { key: 'plan_name', value: planName },
      { key: 'monthly_amount', value: `$${amount}` },
      { key: 'lead_source', value: 'STL Business Guide' },
    ],
  });

  if (result.success) {
    console.log(`✅ BUYER added to GHL: ${customerEmail} - ${planName} ($${amount}/mo)`);
  } else {
    console.error(`❌ Failed to add buyer to GHL: ${result.error}`);
  }

  return result;
}

/**
 * Handle Free Plan signup - send FREE LEAD to GHL for nurturing
 */
export async function handleFreePlanSignupForGHL(
  email: string,
  businessName: string,
  contactName?: string
) {
  // Parse name into first/last (if provided)
  const nameParts = contactName ? contactName.split(' ') : [businessName, ''];
  const firstName = nameParts[0] || businessName;
  const lastName = nameParts.slice(1).join(' ') || '';

  // Create contact in GHL with free lead tags
  const result = await createOrUpdateGHLContact({
    firstName,
    lastName,
    email,
    tags: ['Free Lead', 'STL Business Guide', 'Nurture', 'Prospect'],
    source: 'STL Business Guide - Free Listing',
    customFields: [
      { key: 'business_name', value: businessName },
      { key: 'plan_name', value: 'Free' },
      { key: 'lead_source', value: 'STL Business Guide' },
      { key: 'lead_temperature', value: 'Warm' },
    ],
  });

  if (result.success) {
    console.log(`✅ FREE LEAD added to GHL: ${email} - ${businessName}`);
  } else {
    console.error(`❌ Failed to add free lead to GHL: ${result.error}`);
  }

  return result;
}

/**
 * Handle listing approval - send to GHL CRM with "New Listing" tag
 */
export async function handleListingApprovalForGHL(
  email: string,
  businessName: string,
  contactName: string,
  phone: string,
  planName: string,
  websiteUrl?: string
) {
  // Parse name into first/last
  const nameParts = contactName.split(' ');
  const firstName = nameParts[0] || contactName;
  const lastName = nameParts.slice(1).join(' ') || '';

  // Create contact in GHL with New Listing tag
  const result = await createOrUpdateGHLContact({
    firstName,
    lastName,
    email,
    phone,
    tags: ['New Listing', 'STL Business Guide', planName],
    source: 'STL Business Guide - Listing Approved',
    customFields: [
      { key: 'business_name', value: businessName },
      { key: 'plan_name', value: planName },
      { key: 'website_url', value: websiteUrl || '' },
      { key: 'lead_source', value: 'STL Business Guide' },
      { key: 'lead_temperature', value: 'Hot' },
    ],
  });

  if (result.success) {
    console.log(`✅ NEW LISTING added to GHL: ${email} - ${businessName}`);
  } else {
    console.error(`❌ Failed to add new listing to GHL: ${result.error}`);
  }

  return result;
}
