-- Create Venues bucket for restaurants and hotels images
-- This bucket will store all venue images (restaurants, hotels, etc.)

-- Step 1: Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('Venues', 'Venues', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Step 3: Create new policies
-- Policy: Allow public read access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Venues');

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Venues');

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Venues');

-- Policy: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Venues');

-- Note: Apply these policies in Supabase SQL Editor
-- File types: jpg, jpeg, png, webp, gif
-- Max file size: 5MB (can be configured in Supabase dashboard)
-- 
-- Usage:
-- 1. Run this entire SQL script in Supabase SQL Editor
-- 2. Bucket "Venues" will be created
-- 3. Policies will be applied automatically

