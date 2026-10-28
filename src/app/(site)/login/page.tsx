import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Customer Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextParam = params?.next ? `&next=${encodeURIComponent(params.next)}` : "";
  redirect(`/?auth=login${nextParam}`);
}
