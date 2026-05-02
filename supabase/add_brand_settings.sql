-- Add brand voice settings to integrations table
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_tone TEXT DEFAULT 'professional';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_voice_description TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_signoff TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_avoid TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_example_good TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_example_bad TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS brand_industry TEXT;
