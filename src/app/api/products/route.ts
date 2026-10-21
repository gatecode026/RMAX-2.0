import { getProducts } from "@/lib/data/content";
import { ok, route } from "@/lib/api";

export const GET = route(async () => ok(await getProducts()));
