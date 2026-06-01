# Supabase Schema Quick Reference

## Project URL
https://catwmqztvgmdwiusroar.supabase.co

## Tables Created

| Table | Purpose |
|-------|---------|
| profiles | User accounts linked to Supabase Auth |
| businesses | Core business records |
| business_locations | Address and location data |
| categories | Business category taxonomy |
| business_categories | Many-to-many relationships |
| listing_plans | Free, Premium, VIP plan definitions |
| business_listings | Active listing instances |
| listing_submissions | Approval workflow tracking |
| business_images | Logos and gallery images |
| coupons | Coupon Mania / public coupons |
| banner_ads | VIP banner advertising |
| contact_inquiries | General contact form submissions |
| advertising_inquiries | Sales leads for upgrades/ads |
| payments | Subscription payment tracking |
| admin_activity_log | Admin audit trail |
| reviews | Business reviews |

## Default Plans

| Plan | Monthly | Yearly | Images | Analytics | Coupon | Video | Banner |
|------|---------|--------|--------|-----------|--------|-------|--------|
| Free | $0 | $0 | 1 | ❌ | ❌ | ❌ | ❌ |
| Premium | $47 | $97 | 5 | ✅ | ❌ | ❌ | ❌ |
| VIP | $97 | $497 | 10 | ✅ | ✅ | ✅ | ✅ |

## RLS Policies

- Public can read approved/active listings only
- Business owners can manage their own data
- Admins have full access to all tables

## Next Steps

1. Apply schema via SQL Editor in Supabase Dashboard
2. Set up Storage buckets for images
3. Configure GHL webhooks for lead flow
4. Test listing submission flow