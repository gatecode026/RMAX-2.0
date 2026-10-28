import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Create Customer Account" };

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextParam = params?.next ? `&next=${encodeURIComponent(params.next)}` : "";
  redirect(`/?auth=register${nextParam}`);
}
