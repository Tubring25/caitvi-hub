import { defineMiddleware } from "astro:middleware";
import { drizzle } from "drizzle-orm/d1";

export const onRequest = defineMiddleware(( context, next) => {
  context.locals.db = drizzle(context.locals.runtime.env.DB)
  return next()
})