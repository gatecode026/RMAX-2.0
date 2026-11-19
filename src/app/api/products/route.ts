import { connection } from "next/server";
import { getProducts } from "@/lib/data/content";
import { ok, route } from "@/lib/api";

/**
 * Public catalogue. The data layer is cached and tagged "products"; every product create / edit /
 * delete / status change calls revalidateTag("products"), so no revalidation is needed here (it used
 * to revalidate on EVERY request, defeating the cache). The handler is dynamic (connection()) so the
 * response always reflects the current cache entry; otherwise Next would freeze whatever the first
 * render produced, a database failure included, as the route's static output.
 */
export const GET = route(async () => {
  await connection();
  const products = await getProducts();
  const res = ok(products);
  if (products.length > 0) res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
});
