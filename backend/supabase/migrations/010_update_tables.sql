-- Migration: Refactor vocabulary_examples to a one-to-one relationship
-- Author: VocaBoost Backend Team
-- Date: 2025-07-28

BEGIN;

-- Step 1: Handle potential duplicates from the old one-to-many structure.
-- We will keep only the MOST RECENT example for each word and delete the others.
DELETE FROM public.vocabulary_examples
WHERE id NOT IN (
    SELECT DISTINCT ON (vocabulary_id) id
    FROM public.vocabulary_examples
    ORDER BY vocabulary_id, created_at DESC
);

-- Step 2: Drop the old primary key and the now-redundant 'id' column.
ALTER TABLE public.vocabulary_examples DROP CONSTRAINT IF EXISTS vocabulary_examples_pkey;
ALTER TABLE public.vocabulary_examples DROP COLUMN IF EXISTS id;

-- Step 3: Set the 'vocabulary_id' column as the new primary key.
-- This enforces the one-to-one relationship at the database level.
ALTER TABLE public.vocabulary_examples ADD PRIMARY KEY (vocabulary_id);

-- Step 4: Add a foreign key constraint to ensure data integrity.
-- This also ensures that if a word is deleted, its example is deleted too.
ALTER TABLE public.vocabulary_examples
ADD CONSTRAINT fk_vocabulary_examples_vocabulary
FOREIGN KEY (vocabulary_id) REFERENCES public.vocabulary(id) ON DELETE CASCADE;

-- Step 5: Update the migration tracking table.
INSERT INTO schema_migrations (version, description)
VALUES ('010', 'Refactor vocabulary_examples to one-to-one relationship')
ON CONFLICT (version) DO NOTHING;

COMMIT;