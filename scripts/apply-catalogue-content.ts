/**
 * Applies catalogue names (Basic / Pro / Pro Max), descriptions and how-to-use / troubleshooting text. Idempotent.
 * How-to-use and troubleshooting are stored as product FAQs (rendered by the existing FAQ section).
 *   npm run apply:content -- --dry-run | npm run apply:content
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { ProductFamily } from "../src/models/ProductFamily";
import { variantKeyOf } from "../src/lib/catalog";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
const dryRun = process.argv.includes("--dry-run");

const SAFETY: [string, string] = ["Safety", "Do not tamper with the machine."];

const AUTO = {
  overview: "A convenient way to get sanitary pads on demand in schools, colleges, workplaces, hospitals and restrooms. Easy dispensing upon payment keeps hygiene and privacy intact.",
  faqs: [
    ["How do I use the machine?", "1. Insert payment: insert the required coins/tokens/cards into the slot. 2. Collect pad: retrieve your pad from the collection tray at the bottom."],
    ["Pad not dispensed or payment not accepted?", "Ensure correct payment and no obstructions. Contact support if issues persist."],
    SAFETY,
  ],
};
const MANUAL = {
  overview: "A simple, mechanical sanitary pad vending machine for schools, colleges and workplaces. Insert a coin, turn the dial and collect your pad.",
  faqs: [
    ["How do I use the machine?", "1. Insert payment: carefully insert the required coin(s) into the coin slot. 2. Rotate dial: firmly turn the dial clockwise (or in the direction indicated by the arrow) until it completes a full rotation. 3. Collect pad: retrieve the dispensed sanitary pad from the collection opening at the bottom."],
    ["Dial not turning?", "Ensure the correct coin(s) have been fully inserted. Do not force the dial."],
    ["Pad not dispensed?", "Check the collection opening for any obstructions. If issues persist, please contact maintenance."],
    SAFETY,
  ],
};
const DISPOSAL = {
  overview: "A hygienic, safe and discreet way to dispose of used sanitary pads. It incinerates pads to remove odours and biohazard risks, ideal for schools, offices and healthcare restrooms.",
  faqs: [
    ["How do I use the machine?", "1. Open the lid: gently open the front disposal lid or flap. 2. Place the pad inside: place the used sanitary pad completely inside the disposal chamber. 3. Close the lid: close the lid securely. The machine will automatically begin its incineration process."],
    ["What can I dispose of?", "Only sanitary pads. Do not put any other items such as paper, plastic, or general waste into the machine."],
    ["Is the machine hot during use?", "Yes, it gets warm during the disposal cycle. Avoid touching the exterior of the machine during this time."],
    ["Machine not working?", "If the machine does not start after you close the lid, ensure the lid is fully closed."],
    ["Door jammed?", "Do not force the lid. If it is stuck, contact maintenance."],
    ["Warning light or error message?", "Please contact the provided helpline or maintenance personnel."],
    SAFETY,
  ],
};

const ITEMS: Record<string, { name: string; c: typeof AUTO }> = {
  "automatic-sanitary-napkin-vending-machine": { name: "Automatic Sanitary Pad Vending Machine – Basic", c: AUTO },
  "100-pad-sanitary-napkin-vending-machine": { name: "Automatic Sanitary Pad Vending Machine – Pro", c: AUTO },
  "sanitary-pad-vending-machine-25-pad": { name: "Manual Sanitary Pad Vending Machine – Basic", c: MANUAL },
  "manual-sanitary-pad-vending-machine-50-pad": { name: "Manual Sanitary Pad Vending Machine – Pro", c: MANUAL },
  "sanitary-pad-disposal-machine-100-pad": { name: "Automatic Sanitary Pad Disposal Machine – Basic", c: DISPOSAL },
  "sanitary-pad-disposal-machine": { name: "Automatic Sanitary Pad Disposal Machine – Pro", c: DISPOSAL },
  "sanitary-pad-disposal-machine-500-pad": { name: "Automatic Sanitary Pad Disposal Machine – Pro Max", c: DISPOSAL },
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const [slug, { name, c }] of Object.entries(ITEMS)) {
    const faqs = c.faqs.map(([question, answer], i) => ({ question, answer, order: i + 1, active: true }));
    console.log(`${dryRun ? "[dry-run] " : ""}${slug} → ${name}`);
    if (dryRun) continue;
    const r = await Product.updateOne({ slug }, { $set: { name, title: name, shortName: name, overview: c.overview, intro: c.overview, faqs, "seo.title": `${name} | RMAX Solutions` } });
    if (!r.matchedCount) console.log(`  NOT FOUND: ${slug}`);
  }
  // incinerator family option labels: Small/Medium/Large → Basic/Pro/Pro Max (option values/keys unchanged)
  const labels: Record<string, string> = { small: "Basic", medium: "Pro", large: "Pro Max" };
  if (!dryRun) for (const [value, label] of Object.entries(labels))
    await ProductFamily.updateOne({ slug: "incinerator" }, { $set: { "options.$[].values.$[v].label": label } }, { arrayFilters: [{ "v.value": value }] });
  // Vending family options: Type × Model (Basic/Pro) — the catalogue has no automatic 25-pad, so capacity is no longer a selector.
  if (!dryRun) {
    await ProductFamily.updateOne({ slug: "vending-machine" }, { $set: { options: [
      { key: "operation", label: "Type", values: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
      { key: "model", label: "Model", values: [{ value: "basic", label: "Basic" }, { value: "pro", label: "Pro" }] },
    ] } });
    const fam = await ProductFamily.findOne({ slug: "vending-machine" });
    const V: [string, string, string][] = [
      ["automatic-sanitary-napkin-vending-machine", "automatic", "basic"], ["100-pad-sanitary-napkin-vending-machine", "automatic", "pro"],
      ["sanitary-pad-vending-machine-25-pad", "manual", "basic"], ["manual-sanitary-pad-vending-machine-50-pad", "manual", "pro"],
    ];
    for (const [slug, operation, model] of V) {
      const o = { operation, model };
      await Product.updateOne({ slug }, { $set: { familyId: fam!._id, variantOptions: o, variantKey: variantKeyOf(o) } });
    }
    // empty placeholder (no price, no photos) that no longer matches any catalogue model
    await Product.updateOne({ slug: "automatic-sanitary-pad-vending-machine-25-pad" }, { $set: { status: "archived" }, $unset: { familyId: "", variantOptions: "", variantKey: "" } });
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
