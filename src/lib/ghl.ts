/**
 * GoHighLevel (GHL) API Integration
 * Sends buyer data to GHL for follow-up and nurture campaigns
 */

// GHL API Configuration
const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || ''; // Your GHL location ID
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';

interface GHLContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ id: string; value: string }>;
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
 * Handle Stripe checkout completion - send to GHL
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

  // Create contact in GHL
  const result = await createOrUpdateGHLContact({
    firstName,
    lastName,
    email: customerEmail,
    tags: ['Buyer', `Plan: ${planName}`, 'STL Business Guide', 'Paid Subscriber'],
    source: 'STL Business Guide - Stripe Checkout',
    customFields: [
      { id: 'plan_name', value: planName },
      { id: 'monthly_amount', value: `$${amount}` },
    ],
  });

  if (result.success) {
    console.log(`✅ Buyer added to GHL: ${customerEmail} - ${planName}`);
  } else {
    console.error(`❌ Failed to add buyer to GHL: ${result.error}`);
  }

  return result;
}
