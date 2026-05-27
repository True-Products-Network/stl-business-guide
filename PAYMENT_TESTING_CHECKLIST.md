# Payment Flow Testing Checklist

## Prerequisites
- [ ] Stripe account is configured with test keys
- [ ] Webhook endpoint is configured in Stripe dashboard
- [ ] Test mode is enabled in Stripe

## Test Cards (Stripe Test Mode)

### Successful Payments
- **Visa:** `4242 4242 4242 4242`
- **Any future expiry date** (e.g., 12/30)
- **Any 3-digit CVC** (e.g., 123)
- **Any ZIP** (e.g., 12345)

### Failed Payments
- **Card declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Expired card:** `4000 0000 0000 0069`

---

## Test Scenarios

### 1. Premium Plan Checkout ($97/month)
- [ ] Navigate to `/pricing`
- [ ] Click "Get Started" on Premium plan
- [ ] Verify checkout page loads with correct amount ($97.00)
- [ ] Complete payment with test card `4242 4242 4242 4242`
- [ ] Verify redirect to `/payment/success`
- [ ] Check success message displays correctly
- [ ] Verify business listing is upgraded to Premium in database
- [ ] Check webhook received and processed

### 2. VIP Plan Checkout ($497/month)
- [ ] Navigate to `/pricing`
- [ ] Click "Get Started" on VIP plan
- [ ] Verify checkout page loads with correct amount ($497.00)
- [ ] Complete payment with test card
- [ ] Verify redirect to `/payment/success`
- [ ] Verify business listing is upgraded to VIP in database

### 3. Failed Payment Handling
- [ ] Attempt checkout with declined card `4000 0000 0000 0002`
- [ ] Verify error message displays
- [ ] Verify user stays on checkout page
- [ ] Verify no database changes occur

### 4. Cancelled Checkout
- [ ] Start checkout process
- [ ] Click back or cancel
- [ ] Verify redirect to `/payment/cancel`
- [ ] Verify appropriate message displays
- [ ] Verify no database changes

### 5. Webhook Processing
- [ ] Complete a successful payment
- [ ] Check webhook logs in Stripe dashboard
- [ ] Verify webhook endpoint returns 200 OK
- [ ] Check database for plan_key update
- [ ] Verify business_features records created

### 6. Plan Upgrade
- [ ] Start with Free plan business
- [ ] Upgrade to Premium
- [ ] Verify plan_key updated from "free" to "premium"
- [ ] Upgrade to VIP
- [ ] Verify plan_key updated to "vip"

### 7. Plan Downgrade
- [ ] Start with VIP plan
- [ ] Attempt to downgrade (if supported)
- [ ] Verify behavior and messaging

### 8. Multiple Businesses
- [ ] Create payment for Business A
- [ ] Verify only Business A is upgraded
- [ ] Create payment for Business B
- [ ] Verify Business B is upgraded independently

---

## Database Verification

After each test, verify in Supabase:

```sql
-- Check business listing plan
SELECT b.business_name, bl.id as listing_id, lp.plan_key, lp.name as plan_name
FROM businesses b
JOIN business_listings bl ON bl.business_id = b.id
LEFT JOIN listing_plans lp ON lp.id = bl.plan_id
WHERE b.id = 'YOUR_BUSINESS_ID';

-- Check business features
SELECT * FROM business_features 
WHERE business_listing_id = 'YOUR_LISTING_ID';

-- Check for any webhook events
SELECT * FROM stripe_events 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Stripe Dashboard Checks

- [ ] Payment appears in Stripe dashboard
- [ ] Payment status is "Succeeded"
- [ ] Customer record created
- [ ] Subscription record created (if applicable)
- [ ] Webhook delivery successful

---

## Issues to Watch For

1. **Webhook failures** - Check logs if plan not updating
2. **Duplicate upgrades** - Ensure idempotency
3. **Wrong business updated** - Verify business_id mapping
4. **Currency issues** - Verify USD is used
5. **Tax calculation** - Check if tax should be applied

---

## Post-Testing Cleanup

- [ ] Cancel any test subscriptions in Stripe
- [ ] Delete test customers in Stripe
- [ ] Reset test businesses to free plan if needed
- [ ] Clear test data from database

---

## Files to Check If Issues Occur

```
/src/app/api/stripe/webhook/route.ts
/src/app/api/stripe/create-checkout/route.ts
/src/app/payment/success/page.tsx
/src/app/payment/cancel/page.tsx
/src/lib/supabase.ts
```
