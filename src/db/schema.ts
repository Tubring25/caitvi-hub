import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * Drizzle ORM Schema for Cloudflare D1 (SQLite)
 * 
 * Tables:
 * - fics: Core content table with metadata and ratings
 * - ratings: Vote ledger for community ratings (write-heavy)
 * - shared_collections: User-shared bookshelf snapshots
 * - fic_reports: Dead link/error reporting table
 */

// Table: fics - Core Content Table

export const fics = sqliteTable('fics', {
  id: text('id').primaryKey(),

  title: text('title').notNull(),
  author: text('author').notNull(),
  link: text('link').notNull(),
  summary: text('summary'),

  rating: text('rating', { enum: ['G', 'T', 'M', 'E'] }),
  category: text('category'),
  status: text('status', { enum: ['completed', 'ongoing'] }).default('ongoing'),
  isTranslated: integer('is_translated', { mode: 'boolean' }).default(false),
  tagsJson: text('tags_json'),

  words: integer('words').default(0),
  chapters: integer('chapters').default(1),
  kudos: integer('kudos').default(0),
  hits: integer('hits').default(0),
  comments: integer('comments').default(0),
  bookmarks: integer('bookmarks').default(0),

  baseSpice: integer('base_spice').default(1),
  baseAngst: integer('base_angst').default(1),
  baseFluff: integer('base_fluff').default(1),
  basePlot: integer('base_plot').default(1),
  baseRomance: integer('base_romance').default(1),

  cachedVoteCount: integer('cached_vote_count').default(0),
  cachedSpiceSum: integer('cached_spice_sum').default(0),
  cachedAngstSum: integer('cached_angst_sum').default(0),
  cachedFluffSum: integer('cached_fluff_sum').default(0),
  cachedPlotSum: integer('cached_plot_sum').default(0),
  cachedRomanceSum: integer('cached_romance_sum').default(0),

  quote: text('quote'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Table: ratings - Vote Ledger Table
// Using composite PK (ficId + ipHash) for vote deduplication
export const ratings = sqliteTable('ratings', {
  ficId: text('fic_id')
    .notNull()
    .references(() => fics.id, { onDelete: 'cascade' }),

  ipHash: text('ip_hash').notNull(),

  spice: integer('spice'),
  angst: integer('angst'),
  fluff: integer('fluff'),
  plot: integer('plot'),
  romance: integer('romance'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  primaryKey({
    columns: [table.ficId, table.ipHash],
  }),
]);

// Table: shared_collections - Shared Shelf Table
export const sharedCollections = sqliteTable('shared_collections', {
  shareId: text('share_id').primaryKey(),

  title: text('title').default('My Collection'),

  contentJson: text('content_json').notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Table: fic_reports - Report & Moderation Table
export const ficReports = sqliteTable('fic_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  ficId: text('fic_id')
    .notNull()
    .references(() => fics.id, { onDelete: 'cascade' }),

  ipHash: text('ip_hash').notNull(),

  reason: text('reason').default('broken_link'),

  status: text('status', { enum: ['pending', 'verified', 'rejected'] }).default('pending'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const ficsRelations = relations(fics, ({ many }) => ({
  ratings: many(ratings),
  reports: many(ficReports),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  fic: one(fics, {
    fields: [ratings.ficId],
    references: [fics.id],
  }),
}));

export const ficReportsRelations = relations(ficReports, ({ one }) => ({
  fic: one(fics, {
    fields: [ficReports.ficId],
    references: [fics.id],
  }),
}));

// Type Exports
export type Fic = typeof fics.$inferSelect;
export type NewFic = typeof fics.$inferInsert;

export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;

export type SharedCollection = typeof sharedCollections.$inferSelect;
export type NewSharedCollection = typeof sharedCollections.$inferInsert;

export type FicReport = typeof ficReports.$inferSelect;
export type NewFicReport = typeof ficReports.$inferInsert;
