-- Seed data for curated_lists and curated_list_items
-- Run with: npx wrangler d1 execute caitvi-hub-db --file=scripts/data/seed-lists.sql
--
-- IMPORTANT: fic_id values below reference actual AO3 work IDs from the fics table.
-- Before running, verify these IDs exist in your D1 database.
-- You can query: SELECT id, title, category FROM fics WHERE id IN ('38426080', ...);

-- ── Lists ──

INSERT OR REPLACE INTO curated_lists (id, title, slug, description, cover_mood, sort_order, created_at, updated_at)
VALUES
  ('list-canon', 'Canon Compliant', 'canon-compliant',
   'Stories faithful to the Arcane timeline — filling gaps, extending endings, and exploring what the show left unsaid.',
   'dark', 1, strftime('%s','now'), strftime('%s','now')),

  ('list-domestic', 'Domestic Bliss', 'domestic-bliss',
   'They bought a house. They adopted a cat. They argue about whose turn it is to do the dishes.',
   'warm', 2, strftime('%s','now'), strftime('%s','now')),

  ('list-slowburn', 'Slow Burn 50k+', 'slow-burn',
   'Long reads worth the investment — stories where the tension builds, the payoff lands, and you forget to sleep.',
   'intense', 3, strftime('%s','now'), strftime('%s','now')),

  ('list-angst', 'Prepare to Cry', 'prepare-to-cry',
   'Devastating, beautiful, and absolutely worth the emotional damage. Keep tissues nearby.',
   'dark', 4, strftime('%s','now'), strftime('%s','now')),

  ('list-omegaverse', 'Omegaverse 101', 'omegaverse-101',
   'An introduction to the ABO universe through its finest CaitVi entries. Alpha Vi purists welcome.',
   'wild', 5, strftime('%s','now'), strftime('%s','now'));

-- ── List Items ──
-- Each INSERT uses: (list_id, fic_id, curator_comment, sort_order)
--
-- TODO: Replace fic_id values with actual IDs from your database.
-- Use this query to find candidates per list:
--
--   Canon Compliant:
--     SELECT id, title FROM fics WHERE tags_json LIKE '%Canon Compliant%' OR tags_json LIKE '%Post-Canon%' ORDER BY kudos DESC LIMIT 10;
--
--   Domestic Bliss:
--     SELECT id, title FROM fics WHERE tags_json LIKE '%Domestic%' OR tags_json LIKE '%Found Family%' ORDER BY kudos DESC LIMIT 10;
--
--   Slow Burn 50k+:
--     SELECT id, title FROM fics WHERE words >= 50000 AND tags_json LIKE '%Slow Burn%' ORDER BY kudos DESC LIMIT 10;
--
--   Prepare to Cry:
--     SELECT id, title FROM fics WHERE (base_angst >= 4) ORDER BY kudos DESC LIMIT 10;
--
--   Omegaverse 101:
--     SELECT id, title FROM fics WHERE tags_json LIKE '%Omegaverse%' OR tags_json LIKE '%Alpha/Beta/Omega%' ORDER BY kudos DESC LIMIT 10;

-- Example items (uncomment and fill with real IDs):
--
-- INSERT OR REPLACE INTO curated_list_items (list_id, fic_id, curator_comment, sort_order)
-- VALUES
--   ('list-canon', '35206645', 'The definitive post-S1 continuation. Start here.', 1),
--   ('list-canon', '36528271', NULL, 2),
--   ('list-canon', '35255689', 'A slower take on the aftermath — deeply character-driven.', 3);
