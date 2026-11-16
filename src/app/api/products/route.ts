import { getProducts } from "@/lib/data/content";
import { ok, route } from "@/lib/api";
import { revalidateTag } from "next/cache";

export const GET = route(async () => {
  revalidateTag("products", { expire: 0 });
  return ok(await getProducts());
});

