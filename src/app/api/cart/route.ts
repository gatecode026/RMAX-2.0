import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { cartAddSchema, cartUpdateSchema } from "@/lib/validations/schemas";
import { getCart } from "@/lib/cart";
import { getProductBySlug } from "@/lib/data/content";
import { checkApiRole } from "@/lib/session";

const GUEST_CART_MESSAGE = "Please log in to your RMAX customer account to access your shopping cart.";

export const GET = route(async () => {
  return ok(await getCart());
});

/** Add units of a model to the cart. Customer authentication required — no guest/anonymous cart. */
export const POST = route(async (req: Request) => {
  const auth = await checkApiRole(["customer"]);
  if ("error" in auth) return fail(GUEST_CART_MESSAGE, auth.status === 401 ? 401 : 403);

  const rl = limited(req, "cart", 60, 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = cartAddSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const product = await getProductBySlug(parsed.data.slug);
  if (!product) return fail("That model does not exist.", 404);

  await connectDB();
  const customerId = auth.user.id;
  const cart = (await Cart.findOne({ customerId })) ?? new Cart({ customerId, items: [] });
  const otherItemsCount = cart.items
    .filter((i) => i.slug !== product.slug)
    .reduce((sum, i) => sum + i.quantity, 0);

  if (otherItemsCount >= 5) {
    return fail("Direct online orders are limited to a maximum of 5 units total. Please request a bulk quotation for larger quantities.", 400);
  }

  const allowedForThis = Math.max(1, 5 - otherItemsCount);
  const requestedQty = parsed.data.quantity ?? 1;
  const existing = cart.items.find((i) => i.slug === product.slug);
  const targetQty = (existing ? existing.quantity : 0) + requestedQty;

  if (targetQty > allowedForThis) {
    if (existing) existing.quantity = allowedForThis;
    else cart.items.push({ slug: product.slug, quantity: allowedForThis });
  } else {
    if (existing) existing.quantity = targetQty;
    else cart.items.push({ slug: product.slug, quantity: requestedQty });
  }
  await cart.save();
  return ok(await getCart(), 201);
});

/** Set a line's quantity; 0 removes it. Customer authentication required. */
export const PATCH = route(async (req: Request) => {
  const auth = await checkApiRole(["customer"]);
  if ("error" in auth) return fail(GUEST_CART_MESSAGE, auth.status === 401 ? 401 : 403);

  const rl = limited(req, "cart", 60, 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = cartUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const product = await getProductBySlug(parsed.data.slug);
  if (!product) return fail("That model does not exist.", 404);

  await connectDB();
  const customerId = auth.user.id;
  const cart = await Cart.findOne({ customerId });
  if (!cart) return ok(await getCart());
  const idx = cart.items.findIndex((i) => i.slug === product.slug);
  if (idx === -1) return fail("That model is not in your cart.", 404);

  const otherItemsCount = cart.items
    .filter((i) => i.slug !== product.slug)
    .reduce((sum, i) => sum + i.quantity, 0);

  if (parsed.data.quantity > 0 && otherItemsCount + parsed.data.quantity > 5) {
    return fail("Direct online orders are limited to a maximum of 5 units total across your order. For 6 or more units, please request a bulk quotation.", 400);
  }

  if (parsed.data.quantity === 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = parsed.data.quantity;
  await cart.save();
  return ok(await getCart());
});

/** Clears the authenticated customer's entire cart (used on logout / explicit "empty cart"). */
export const DELETE = route(async () => {
  const auth = await checkApiRole(["customer"]);
  if ("error" in auth) return fail(GUEST_CART_MESSAGE, auth.status === 401 ? 401 : 403);
  await connectDB();
  await Cart.deleteOne({ customerId: auth.user.id });
  return ok(await getCart());
});
