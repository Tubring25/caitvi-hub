-- Seed data for curated_lists and curated_list_items
-- Run with: npx wrangler d1 execute caitvi-hub-db --file=scripts/data/seed-lists.sql
--
-- List items are explicit curator selections. The JOIN against fics only skips
-- missing imports; it does not auto-select replacements.

-- Clear legacy/generated list content before applying the curated set.
DELETE FROM curated_list_items
WHERE list_id IN (
  'list-essentials',
  'list-canon',
  'list-domestic',
  'list-slowburn',
  'list-angst',
  'list-omegaverse'
);

DELETE FROM curated_lists
WHERE id IN ('list-canon', 'list-omegaverse');

-- Lists

INSERT OR REPLACE INTO curated_lists (id, title, slug, description, cover_mood, sort_order, created_at, updated_at)
VALUES
  ('list-essentials', 'The Essentials', 'essentials',
   'The definitive starting point — the fics that define CaitVi fan fiction. If you read nothing else, read these.',
   'soft', 1, strftime('%s','now'), strftime('%s','now')),

  ('list-domestic', 'Domestic Bliss', 'domestic-bliss',
   'They bought a house. They adopted a cat. They argue about whose turn it is to do the dishes.',
   'warm', 2, strftime('%s','now'), strftime('%s','now')),

  ('list-slowburn', 'Slow Burn 50k+', 'slow-burn',
   'Long reads worth the investment — the tension builds, the payoff lands, and you forget to sleep.',
   'intense', 3, strftime('%s','now'), strftime('%s','now')),

  ('list-angst', 'Prepare to Cry', 'prepare-to-cry',
   'Devastating, beautiful, and absolutely worth the emotional damage. Keep tissues nearby.',
   'dark', 4, strftime('%s','now'), strftime('%s','now'));

-- Curated items

WITH selected_items(list_id, fic_id, curator_comment, sort_order) AS (
  VALUES
    ('list-essentials', '38426080', 'The modern AU that started it all for many readers. SunsetSharkbite at peak form.', 1),
    ('list-essentials', '38670828', 'An absolute epic. If you have the stamina, this will reward every hour.', 2),
    ('list-essentials', '36528271', NULL, 3),
    ('list-essentials', '35206645', 'Short but devastating. A masterclass in emotional density.', 4),
    ('list-essentials', '36793138', 'The high school AU you didn''t know you needed.', 5),

    ('list-domestic', '35255689', 'Pure serotonin. The fluffiest fic in the collection.', 1),
    ('list-domestic', '58047325', 'Fake dating + legal chaos + maximum softness.', 2),
    ('list-domestic', '36558961', NULL, 3),
    ('list-domestic', '35803180', 'Wedding fic. Short, sweet, perfect.', 4),

    ('list-slowburn', '39945543', 'The emotional epic. 200k words and every one of them earned.', 1),
    ('list-slowburn', '60133222', 'Royal AU with teeth. The slow burn is agonizing in the best way.', 2),
    ('list-slowburn', '60890161', NULL, 3),
    ('list-slowburn', '36793138', 'Also a slow burn, also over 100k. You will not regret this.', 4),
    ('list-slowburn', '57287698', NULL, 5),
    ('list-slowburn', '40996224', 'Underrated gem. The pacing is impeccable.', 6),

    ('list-angst', '62266195', 'The one that broke me. Proceed with caution.', 1),
    ('list-angst', '35507641', NULL, 2),
    ('list-angst', '35825698', 'Shorter but it will wreck you.', 3),
    ('list-angst', '57287698', 'The angst is relentless but the writing is gorgeous.', 4),
    ('list-angst', '40996224', NULL, 5)
)
INSERT OR REPLACE INTO curated_list_items (list_id, fic_id, curator_comment, sort_order)
SELECT selected_items.list_id, selected_items.fic_id, selected_items.curator_comment, selected_items.sort_order
FROM selected_items
INNER JOIN fics ON fics.id = selected_items.fic_id;

WITH curated_metadata(fic_id, curator_note, content_signals) AS (
  VALUES
    ('38426080', 'A gateway modern AU: sharp banter, strong pacing, and the kind of chemistry that explains why this pairing stuck.', '["modern_au","comfort_read"]'),
    ('38670828', 'A long-form commitment pick. The scale is big, but the emotional throughline keeps the whole thing moving.', '["long_read","slow_burn"]'),
    ('36528271', 'A polished essentials pick with enough tension and tenderness to work as an early CaitVi reading stop.', '["canon_adjacent","slow_burn"]'),
    ('35206645', 'Brief, focused, and emotionally dense. This one earns its place by doing a lot with very little space.', '["heavy_angst","canon_adjacent"]'),
    ('36793138', 'A big AU read with real momentum. Start it when you want to stay in one version of them for a while.', '["modern_au","long_read","slow_burn"]'),

    ('35255689', 'Soft, direct, and easy to recommend when someone wants domestic CaitVi without a long runway.', '["tooth_rotting_fluff","comfort_read"]'),
    ('58047325', 'A playful setup that knows exactly how to turn fake dating into emotional softness.', '["modern_au","tooth_rotting_fluff","comfort_read"]'),
    ('36558961', 'A gentle domestic pick, best for readers who want the relationship texture more than plot machinery.', '["tooth_rotting_fluff","comfort_read"]'),
    ('35803180', 'Short, warm, and complete. A clean example of domestic intimacy doing the whole job.', '["tooth_rotting_fluff","comfort_read"]'),

    ('39945543', 'The slow-burn epic slot: huge, emotional, and built for readers who want to sink into the arc.', '["long_read","slow_burn","heavy_angst"]'),
    ('60133222', 'Royal AU pressure with enough bite to keep the romance from feeling too easy.', '["slow_burn","long_read","heavy_angst"]'),
    ('60890161', 'A slow-burn catalog pick for readers who want tension, uncertainty, and delayed payoff.', '["slow_burn","long_read"]'),
    ('57287698', 'Beautifully painful. This belongs on both the slow-burn and angst paths for good reason.', '["slow_burn","heavy_angst","long_read"]'),
    ('40996224', 'Underrated and carefully paced, with the kind of structure that rewards patient reading.', '["slow_burn","heavy_angst"]'),

    ('62266195', 'A high-impact angst pick. Read it when you actively want the ache.', '["heavy_angst","explicit"]'),
    ('35507641', 'Quietly devastating, and a strong fit for the emotional end of the catalog.', '["heavy_angst","canon_adjacent"]'),
    ('35825698', 'Compact, sharp, and built to hurt quickly.', '["heavy_angst"]')
)
UPDATE fics
SET
  curator_note = (
    SELECT curated_metadata.curator_note
    FROM curated_metadata
    WHERE curated_metadata.fic_id = fics.id
  ),
  content_signals = (
    SELECT curated_metadata.content_signals
    FROM curated_metadata
    WHERE curated_metadata.fic_id = fics.id
  ),
  source_last_checked_at = CAST(strftime('%s','now') AS INTEGER)
WHERE id IN (SELECT fic_id FROM curated_metadata);
