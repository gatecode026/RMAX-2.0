import { config } from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/mongodb";
import { faqItems, policyPages, demoUser, homeStats, productTrust, reviewSummary, testimonials } from "../src/data/seed";
import { Testimonial } from "../src/models/Testimonial";
import { SiteSetting } from "../src/models/SiteSetting";
import { FaqItem } from "../src/models/FaqItem";
import { PolicyPage } from "../src/models/PolicyPage";
import { User } from "../src/models/User";

config({ path: ".env.local" });
config();

// Products are no longer seeded from static data — the database is the sole source of truth,
// managed entirely through the Admin product pages. This script seeds everything else only.
async function main() {
  await connectDB();

  await FaqItem.deleteMany({});
  await FaqItem.insertMany(faqItems);
  console.log(`✔ ${faqItems.length} FAQ items`);

  await PolicyPage.deleteMany({});
  await PolicyPage.insertMany(policyPages);
  console.log(`✔ ${policyPages.length} policy pages`);

  await Testimonial.deleteMany({});
  await Testimonial.insertMany(testimonials);
  console.log(`✔ ${testimonials.length} testimonials`);

  await SiteSetting.deleteMany({ key: { $in: ["home.stats", "home.reviews", "product.trust"] } });
  await SiteSetting.insertMany([
    { key: "home.stats", value: homeStats },
    { key: "home.reviews", value: reviewSummary },
    { key: "product.trust", value: productTrust },
  ]);
  console.log("✔ home stats + review summary");

  // Demo account (facilities@example.org). The design shows no password, so it comes from the env.
  // No demo ORDER is created here any more — it previously referenced a seeded product, and
  // products are no longer seeded (see the comment above `main`).
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 8) {
    console.warn("• SEED_DEMO_PASSWORD missing or shorter than 8 chars — skipping demo account.");
  } else {
    await User.deleteOne({ email: demoUser.email });
    await User.create({
      name: demoUser.name,
      email: demoUser.email,
      organization: demoUser.organization,
      shippingAddress: demoUser.shippingAddress,
      billingSameAsShipping: true,
      passwordHash: await bcrypt.hash(demoPassword, 12),
    });
    console.log(`✔ demo account ${demoUser.email}`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
