import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { nextSequence } from "@/models/Counter";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations/schemas";
import { clearCart, getCart } from "@/lib/cart";
import { getSessionUserId } from "@/lib/session";
import { buildSpecLine } from "@/lib/specs";
import { CART_COOKIE, LAST_ORDER_COOKIE } from "@/lib/constants";
import { toOrderDTO } from "@/lib/data/orders";

/** List the signed-in user's orders (newest first). */
export const GET = route(async () => {
  const userId = await getSessionUserId();
  if (!userId) return fail("Please log in.", 401);
  await connectDB();
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return ok(orders.map(toOrderDTO));
});

/** Place an order from the current cart (guest or logged-in). */
export const POST = route(async (req: Request) => {
  const rl = limited(req, "orders", 10, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = checkoutSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);
  const d = parsed.data;

  const cart = await getCart();
  if (cart.lines.length === 0) return fail("Your cart is empty.", 409);

  await connectDB();
  const userId = await getSessionUserId();
  const seq = await nextSequence("order");
  const reference = `RMAX-DEMO-${String(seq).padStart(3, "0")}`;
  const now = new Date();

  await Order.create({
    reference,
    user: userId ?? undefined,
    contact: { fullName: d.fullName, email: d.email, phone: d.phone },
    items: cart.lines.map((l) => ({
      product: l.product._id,
      slug: l.product.slug,
      title: l.product.title,
      shortName: l.product.shortName,
      specLine: buildSpecLine(l.product.specs),
      unitPrice: l.product.price,
      originalPrice: l.product.originalPrice,
      quantity: l.quantity,
      image: l.product.image.src,
    })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    shippingAddress: {
      organization: d.organization,
      department: d.department,
      street: d.street,
      line2: d.line2,
      city: d.city,
      state: d.state,
      postalCode: d.postalCode,
      country: d.country,
      notes: d.notes,
    },
    billing: {
      sameAsShipping: d.billingSameAsShipping,
      organization: d.billingSameAsShipping ? d.billingOrganization || d.organization : d.billingOrganization!,
      poReference: d.poReference,
    },
    payment: { method: d.paymentMethod, status: "illustrative" },
    status: "preparing",
    timeline: [
      { step: "confirmed", at: now },
      { step: "preparing" },
      { step: "dispatched" },
      { step: "delivered" },
    ],
    termsAcceptedAt: now,
    isIllustrative: true,
  });

  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  if (token) await clearCart(token);
  // Lets a guest view their own confirmation page without an account.
  jar.set(LAST_ORDER_COOKIE, reference, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return ok({ reference }, 201);
});
