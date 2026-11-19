/** Assert-based check of the pure catalogue helpers: `npx tsx scripts/catalog-check.ts` */
import assert from "node:assert/strict";
import { buildCards, pickerGroups, variantLabel, type FamilyDTO, type Member } from "../src/lib/catalog";

const fam: FamilyDTO = {
  _id: "f1",
  name: "Vending Machine",
  slug: "vending-machine",
  defaultProduct: "p-a50",
  options: [
    { key: "operation", label: "Operation", values: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
    { key: "capacity", label: "Capacity", values: [{ value: "25", label: "25 Pads" }, { value: "50", label: "50 Pads" }, { value: "100", label: "100 Pads" }] },
  ],
};
const m = (id: string, operation: string, capacity: string, sortOrder: number): Member => ({ _id: id, slug: id, sortOrder, familyId: "f1", variantOptions: { operation, capacity } });
// published: Automatic 50, Manual 25 only (the other two combinations are not available)
const published: Member[] = [m("p-a50", "automatic", "50", 2), m("p-m25", "manual", "25", 3), { _id: "gps", slug: "gps", sortOrder: 9 }];

// cards: one per family + standalone, default member represents the family
const cards = buildCards(published, published, [fam]);
assert.equal(cards.length, 2);
assert.equal(cards[0].slug, "p-a50");
assert.equal(cards[0].group?.title, "Vending Machine");
assert.equal(cards[0].group?.badge, "2 options");
assert.equal(cards[1].slug, "gps");

// a filter / search that leaves only one variant opens that variant
const only = buildCards([published[1]], published, [fam]);
assert.equal(only.length, 1);
assert.equal(only[0].slug, "p-m25");

// default missing from the list -> first listed member (deterministic)
assert.equal(buildCards([published[1]], published, [{ ...fam, defaultProduct: "p-a50" }])[0].slug, "p-m25");

// picker: current = Automatic 50
const g = pickerGroups(published[0], fam, published);
const op = g[0].options, cap = g[1].options;
assert.equal(op.find((o) => o.value === "automatic")?.active, true);
assert.equal(op.find((o) => o.value === "manual")?.slug, "p-m25"); // no Manual 50 -> nearest published Manual
assert.equal(cap.find((o) => o.value === "25")?.slug, "p-m25"); // no Automatic 25 -> nearest published 25
assert.equal(cap.find((o) => o.value === "100")?.slug, null); // no published 100-pad product -> disabled

// when the exact combination exists, the other option is preserved
const full = [...published, m("p-m50", "manual", "50", 4)];
assert.equal(pickerGroups(published[0], fam, full)[0].options.find((o) => o.value === "manual")?.slug, "p-m50");

assert.equal(variantLabel(published[1], fam), "Vending Machine · Manual · 25 Pads");
assert.equal(variantLabel({ _id: "x", slug: "x" }, undefined), null);
console.log("catalog-check: all assertions passed");
