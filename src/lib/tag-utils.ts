/**
 * Tag categorization for fic detail page.
 *
 * Groups fic tags into Setting, Tropes, Content (NSFW), and Characters
 * for structured display. Filters out universal CaitVi tags.
 */

// Tags present on every fic — no value on detail page
const HIDDEN_TAGS = new Set([
  "Arcane: League of Legends (Cartoon 2021)",
  "League of Legends",
  "Caitlyn (League of Legends)",
  "Vi (League of Legends)",
  "Caitlyn/Vi (League of Legends)",
  "Caitlyn & Vi (League of Legends)",
]);

// Character names without (League of Legends) suffix
const KNOWN_CHARACTERS = new Set([
  "Mel Medarda",
  "Ambessa Medarda",
  "Cassandra Kiramman",
  "Tobias Kiramman",
  "Maddie Nolen",
  "Orianna Reveck",
  "Miss Sarah Fortune",
]);

// Trait-prefixed character tags that should go to tropes/content, not characters
const TRAIT_PREFIXES = [
  "Bottom", "Top", "Dom", "Sub", "Alpha", "Omega", "Beta",
  "Jealous", "Soft", "Hockey Player", "Mechanic", "Therapist",
  "Hexstrap", "Protective", "Enforcer", "Lesbian", "Useful",
  "Useless", "Bratty", "Brat Tamer", "Devil", "Vampire",
  "Werewolf", "Arachne", "Priestess", "Neko", "Oni",
];

const SETTING_KEYWORDS = [
  "Alternate Universe",
  "Post-Canon", "Pre-Canon", "Canon Compliant", "Canon Divergence",
  "Modern AU", "Historical AU", "Coffee Shop", "College AU",
  "Omegaverse", "Sci-Fi",
];

const NSFW_KEYWORDS = [
  "sex", "fingering", "oral", "strap", "cunnilingus", "tribbing",
  "blow job", "smut", "kink", "bdsm", "breeding", "rimming",
  "69", "choking", "spanking", "edging", "masturbat", "squirt",
  "vaginal", "anal", "orgasm", "penis", "cock", "exhib", "voyeur",
  "somnophilia", "overstimul", "objectif", "face-sit", "handcuff",
  "restraint", "manhandl", "possessive sex", "rough sex", "nude",
  "nsfw", "threesome", "monsterfuck", "teratoph", "body worship",
  "spit kink", "finger suck", "strap suck", "phone sex", "mirror sex",
  "dom/sub", "impact play", "praise kink", "begging", "discipline",
  "dacryphilia", "blood kink", "dry hump", "grinding", "grind",
  "degradation", "blindfold", "hair-pull", "doggy", "puppy play",
  "creampie", "dirty talk", "teasing", "aftercare", "size difference",
  "knifeplay", "bite", "biting", "marking", "hickey",
  "explicit sexual", "porn", "lesbian sex",
];

const TROPE_KEYWORDS = [
  "burn", "lovers", "pining", "dating", "hurt", "comfort",
  "angst", "fluff", "crack", "humor", "found family",
  "redemption", "domestic", "tooth-rot", "happy end",
  "first time", "first kiss", "confession", "one shot",
  "5+1", "getting together", "established relationship",
  "idiots in love", "slow build", "mutual pining",
  "fake", "pretend", "miscommunication", "yearning",
  "soulmate", "falling in love", "denial of feeling",
  "eventual romance", "married", "healing",
  "friends to", "enemies to", "hate to",
  "in love", "useless lesbian", "useful lesbian",
  "butch", "femme",
];

function hasKeyword(tag: string, keywords: string[]): boolean {
  const lower = tag.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function isCharacterTag(tag: string): boolean {
  if (KNOWN_CHARACTERS.has(tag)) return true;
  if (!/\((?:League of Legends|Arcane[^)]*)\)$/.test(tag)) return false;
  const base = tag.replace(/ \((?:League of Legends|Arcane[^)]*)\)$/, "");
  if (base.includes("/") || base.includes("&")) return false;
  return !TRAIT_PREFIXES.some(p => base.startsWith(p));
}

function cleanCharacterName(tag: string): string {
  return tag.replace(/ \((?:League of Legends|Arcane[^)]*)\)$/, "");
}

function cleanSettingTag(tag: string): string {
  return tag.replace(/^Alternate Universe - /, "");
}

export type TagGroup = {
  key: string;
  label: string;
  tags: string[];
  collapsed?: boolean;
};

export function categorizeTags(tags: string[]): TagGroup[] {
  const filtered = tags.filter(t => !HIDDEN_TAGS.has(t));
  const groups: TagGroup[] = [];

  const setting: string[] = [];
  const tropes: string[] = [];
  const nsfw: string[] = [];
  const characters: string[] = [];
  const other: string[] = [];

  for (const tag of filtered) {
    if (isCharacterTag(tag)) {
      characters.push(cleanCharacterName(tag));
    } else if (hasKeyword(tag, SETTING_KEYWORDS)) {
      setting.push(cleanSettingTag(tag));
    } else if (hasKeyword(tag, NSFW_KEYWORDS)) {
      nsfw.push(tag);
    } else if (hasKeyword(tag, TROPE_KEYWORDS)) {
      tropes.push(tag);
    } else {
      other.push(tag);
    }
  }

  // Merge other into tropes (they're generally misc descriptors)
  const tropesFinal = [...tropes, ...other];

  if (setting.length > 0) groups.push({ key: "setting", label: "Setting", tags: setting });
  if (tropesFinal.length > 0) groups.push({ key: "tropes", label: "Tropes & Tone", tags: tropesFinal });
  if (nsfw.length > 0) groups.push({ key: "nsfw", label: "Content Tags", tags: nsfw, collapsed: true });
  if (characters.length > 0) groups.push({ key: "characters", label: "Persons of Interest", tags: characters });

  return groups;
}
