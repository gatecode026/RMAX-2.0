import { fail, ok, route } from "@/lib/api";
import { getOwnedOrder } from "@/lib/data/orders";

export const GET = route(async (_req: Request, ctx: { params: Promise<{ ref: string }> }) => {
  const { ref } = await ctx.params;
  const order = await getOwnedOrder(ref);
  return order ? ok(order) : fail("Order not found.", 404);
});
