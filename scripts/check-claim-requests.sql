-- Check claim_requests table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'claim_requests' 
ORDER BY 
    ordinal_position;
