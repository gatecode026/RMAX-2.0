import { config } from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/mongodb";
import { products, faqItems, policyPages, demoUser, demoOrder, homeStats, productTrust, reviewSummary, testimonials } from "../src/data/seed";
import { Testimonial } from "../src/models/Testimonial";
import { SiteSetting } from "../src/models/SiteSetting";
import { Product } from "../src/models/Product";
import { FaqItem } from "../src/models/FaqItem";
import { PolicyPage } from "../src/models/PolicyPage";
import { User } from "../src/models/User";
import { Order } from "../src/models/Order";
import { Counter } from "../src/models/Counter";
import { buildSpecLine } from "../src/lib/specs";

config({ path: ".env.local" });
config();

async function main() {
  await connectDB();

  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(products);
  console.log(`✔ ${createdProducts.length} products`);

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
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 8) {
    console.warn("• SEED_DEMO_PASSWORD missing or shorter than 8 chars — skipping demo account and order.");
  } else {
    await Order.deleteOne({ reference: demoOrder.reference });
    await User.deleteOne({ email: demoUser.email });
    const user = await User.create({
      name: demoUser.name,
      email: demoUser.email,
      organization: demoUser.organization,
      shippingAddress: demoUser.shippingAddress,
      billingSameAsShipping: true,
      passwordHash: await bcrypt.hash(demoPassword, 12),
    });
    const pro = createdProducts.find((p) => p.slug === demoOrder.productSlug)!;
    const subtotal = pro.price * demoOrder.quantity;
    await Order.create({
      reference: demoOrder.reference,
      user: user._id,
      contact: { fullName: demoUser.name, email: demoUser.email, phone: "0000000000" },
      items: [
        {
          product: pro._id,
          slug: pro.slug,
          title: pro.title,
          shortName: pro.shortName,
          specLine: buildSpecLine(pro.specs),
          unitPrice: pro.price,
          originalPrice: pro.originalPrice,
          quantity: demoOrder.quantity,
          image: pro.image.src,
        },
      ],
      subtotal,
      shipping: 0,
      total: subtotal,
      shippingAddress: {
        organization: demoUser.shippingAddress.organization,
        department: demoUser.shippingAddress.department,
        street: demoUser.shippingAddress.street,
        city: demoUser.shippingAddress.city,
        state: demoUser.shippingAddress.state,
        postalCode: demoUser.shippingAddress.postalCode,
        country: demoUser.shippingAddress.country,
      },
      billing: { sameAsShipping: true, organization: demoUser.organization },
      payment: { method: "Online payment · example selection", status: "illustrative" },
      status: "preparing",
      timeline: [
        { step: "confirmed", at: demoOrder.placedAt },
        { step: "preparing" },
        { step: "dispatched" },
        { step: "delivered" },
      ],
      termsAcceptedAt: demoOrder.placedAt,
      isIllustrative: true,
    });
    // Backdate to the date shown in the design (08 Oct 2026).
    // (createdAt is immutable in Mongoose, so go through the native collection.)
    await Order.collection.updateOne(
      { reference: demoOrder.reference },
      { $set: { createdAt: demoOrder.placedAt, updatedAt: demoOrder.placedAt } },
    );
    await Counter.findOneAndUpdate({ key: "order" }, { $max: { seq: 1 } }, { upsert: true });
    console.log(`✔ demo account ${demoUser.email} + order ${demoOrder.reference}`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
