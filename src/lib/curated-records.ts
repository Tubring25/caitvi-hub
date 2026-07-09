import { sql } from "drizzle-orm";

import { curatedListItems, fics } from "@/db/schema";

export function curatedRecordCondition() {
  return sql`exists (
    select 1
    from ${curatedListItems}
    where ${curatedListItems.ficId} = ${fics.id}
  )`;
}
