"use client";

import Form from "next/form";
import { SelectInput, TextInput } from "@/components/ui/Field";
import { STATUS_OPTIONS } from "@/lib/order-ui";

/** GET form: Enter submits the search, changing the status submits immediately. */
export function OrderFilters({ q, status }: { q: string; status: string }) {
  return (
    <Form action="/account/orders" className="grid gap-x-6 gap-y-4 md:grid-cols-2" role="search">
      <TextInput label="Find an order" name="q" type="search" placeholder="Search by order reference" defaultValue={q} maxLength={40} />
      <SelectInput label="Order status" name="status" defaultValue={status} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        <option value="">All orders</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </SelectInput>
    </Form>
  );
}
