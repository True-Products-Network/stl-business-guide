-- Check claim request history for this business
-- Business ID: a151c067-db4d-48c2-b1af-e9ec890a7fa0

-- Check claim requests
SELECT 
    cr.id,
    cr.claimant_name,
    cr.claimant_email,
    cr.status as claim_status,
    cr.admin_notes,
    cr.proof_notes,
    cr.created_at,
    cr.updated_at
FROM claim_requests cr
WHERE cr.business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0'
ORDER BY cr.created_at DESC;

-- Check if there's any activity log or audit trail
-- (if you have such a table)
SELECT 
    b.id,
    b.business_name,
    b.email,
    b.business_owner_name,
    b.created_at,
    b.updated_at
FROM businesses b
WHERE b.id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- Check business listings history
SELECT 
    bl.id,
    bl.listing_status,
    bl.payment_status,
    bl.created_at,
    bl.updated_at
FROM business_listings bl
WHERE bl.business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0'
ORDER BY bl.updated_at DESC;
