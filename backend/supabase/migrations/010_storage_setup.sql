-- Migration: Storage Setup for Word Images
-- Author: VocaBoost Backend Team
-- Date: 2025-07-12

BEGIN;

-- =================================================================
--  1. Create the Storage Bucket
--  We use a DO block to check for the bucket's existence first.
-- =================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'word_images'
  ) THEN
    -- Create the 'word_images' bucket using Supabase's built-in storage function.
    -- The bucket is private by default, access is controlled by RLS policies.
    PERFORM storage.create_bucket('word_images', '{ "public": false }');
    
    RAISE NOTICE 'Bucket "word_images" created.';
  ELSE
    RAISE NOTICE 'Bucket "word_images" already exists.';
  END IF;
END $$;


-- =================================================================
--  2. Create Row Level Security (RLS) Policies
--  These policies define who can do what with the files in the bucket.
-- =================================================================

-- First, drop existing policies to ensure this script can be re-run to update them.
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Policy 1: Allow any authenticated user to UPLOAD (INSERT) an image.
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'word_images'
);

-- Policy 2: Allow anyone (public) to VIEW (SELECT) an image.
-- This is necessary so the `imageUrl` can be used directly in an <img> tag.
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public -- 'public' is a shorthand role for both anon and authenticated
USING (
  bucket_id = 'word_images'
);


-- =================================================================
--  3. Update the Migration Tracking Table
-- =================================================================
INSERT INTO schema_migrations (version, description) 
VALUES ('009', 'Setup storage bucket and policies for word images')
ON CONFLICT (version) DO NOTHING;

COMMIT;