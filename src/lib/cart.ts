import "server-only";
import { connection } from "next/server";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { getAllProducts, type ProductDTO } from "@/lib/data/content";
import { getSessionUser } from "@/lib/session";

export type CartLine = { product: ProductDTO; quantity: number; lineTotal: number };
export type CartView = {
  lines: CartLine[];
  count: number; // total units
  subtotal: number;
  shipping: number;
  total: number;
};

const EMPTY: CartView = { lines: [], count: 0, subtotal: 0, shipping: 0, total: 0 };

/**
 * Resolve the cart for the current request (read-only).
 *
 * Carts belong strictly to an authenticated Customer account — there is no guest/anonymous
 * cart. A visitor with no Customer session (including a visitor who only has an Admin or
 * Manager session) always sees an empty cart; Add to Cart / Buy Now require signing in first.
 */
export async function getCart(): Promise<CartView> {
  await connection(); // per-visitor data: never part of a prerender
  const customer = await getSessionUser("customer");
  if (!customer) return EMPTY;

  let cart;
  try {
    await connectDB();
    cart = await Cart.findOne({ customerId: customer.id }).lean();
  } catch (err) {
    // Without a database the cart simply shows as empty (every page renders the navbar's cart count).
    if (isDatabaseUnavailable(err)) return EMPTY;
    throw err;
  }
  if (!cart || cart.items.length === 0) return EMPTY;
  const products = await getAllProducts();
  const lines: CartLine[] = [];
  for (const item of cart.items) {
    const product = products.find((p) => p.slug === item.slug);
    if (product) lines.push({ product, quantity: item.quantity, lineTotal: product.price * item.quantity });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  return {
    lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    shipping: 0, // free shipping on every model
    total: subtotal,
  };
}

/**
 * Resolves the authenticated customer's id for mutating cart routes. Callers MUST have already
 * verified a Customer session (e.g. via checkApiRole(["customer"])) before calling this — it
 * does not itself reject guests, it just has nothing to return for one.
 */
export async function requireCartCustomerId(): Promise<string | null> {
  const customer = await getSessionUser("customer");
  return customer?.id ?? null;
}

export async function clearCart(customerId: string) {
  await connectDB();
  await Cart.deleteOne({ customerId });
}
