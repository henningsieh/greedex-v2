SELECT id,
       name,
       email,
       email_verified,
       image,
       created_at,
       updated_at
FROM public."user"
LIMIT 1000;