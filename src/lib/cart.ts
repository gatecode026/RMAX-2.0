import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { getAllProducts, type ProductDTO } from "@/lib/data/content";
import { CART_COOKIE } from "@/lib/constants";

export type CartLine = { product: ProductDTO; quantity: number; lineTotal: number };
export type CartView = {
  lines: CartLine[];
  count: number; // total units
  subtotal: number;
  shipping: number;
  total: number;
};

const EMPTY: CartView = { lines: [], count: 0, subtotal: 0, shipping: 0, total: 0 };

/** Resolve the cart for the current browser (read-only). */
export async function getCart(): Promise<CartView> {
  await connection(); // per-visitor data: never part of a prerender
  const token = (await cookies()).get(CART_COOKIE)?.value;
  if (!token) return EMPTY;
  let cart;
  try {
    await connectDB();
    cart = await Cart.findOne({ token }).lean();
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

/** Cart token for mutating routes — creates one (and sets the cookie) when missing. */
export async function getOrCreateCartToken(): Promise<string> {
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return token;
}

export async function clearCart(token: string) {
  await connectDB();
  await Cart.deleteOne({ token });
}
