import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { cartAddSchema, cartUpdateSchema } from "@/lib/validations/schemas";
import { getCart, getOrCreateCartToken } from "@/lib/cart";
import { getProductBySlug } from "@/lib/data/content";

export const GET = route(async () => {
  return ok(await getCart());
});

/** Add one unit of a model to the cart. */
export const POST = route(async (req: Request) => {
  const rl = limited(req, "cart", 60, 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = cartAddSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const product = await getProductBySlug(parsed.data.slug);
  if (!product) return fail("That model does not exist.", 404);

  await connectDB();
  const token = await getOrCreateCartToken();
  const cart = (await Cart.findOne({ token })) ?? new Cart({ token, items: [] });
  const existing = cart.items.find((i) => i.slug === product.slug);
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 999);
  else cart.items.push({ slug: product.slug, quantity: 1 });
  await cart.save();
  return ok(await getCart(), 201);
});

/** Set a line's quantity; 0 removes it. */
export const PATCH = route(async (req: Request) => {
  const rl = limited(req, "cart", 60, 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = cartUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const product = await getProductBySlug(parsed.data.slug);
  if (!product) return fail("That model does not exist.", 404);

  await connectDB();
  const token = await getOrCreateCartToken();
  const cart = await Cart.findOne({ token });
  if (!cart) return ok(await getCart());
  const idx = cart.items.findIndex((i) => i.slug === product.slug);
  if (idx === -1) return fail("That model is not in your cart.", 404);
  if (parsed.data.quantity === 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = parsed.data.quantity;
  await cart.save();
  return ok(await getCart());
});
