/**
 * Seed content — transcribed verbatim from the design images in `.context/`.
 * Pure data (no DB access) so it can be imported anywhere.
 */
import type { IDetailPoint, IGalleryItem, IImage, IProduct, IProductSpecs } from "@/models/Product";
import type { IFaqItem } from "@/models/FaqItem";
import type { IPolicyPage } from "@/models/PolicyPage";
import type { ITestimonial } from "@/models/Testimonial";

const SHARED_SPECS = {
  cycleDuration: "3–4 minutes",
  chamber: "Enclosed high-temperature",
  maintenance: "Low maintenance",
  warranty: "1 year",
  delivery: "3–5 days · Free shipping",
} as const;

const baseProducts: Omit<IProduct, "category" | "colours">[] = [
  {
    slug: "basic",
    name: "Basic",
    title: "Napkin Incinerator Machine (Basic)",
    shortName: "Basic napkin incinerator",
    price: 3000,
    originalPrice: 6000,
    discountPercent: 50,
    image: { src: "/images/product-basic.png", alt: "RMAX Basic napkin incinerator — white and blue unit", width: 256, height: 166 },
    cardImage: { src: "/images/home/card-basic.png", alt: "RMAX Basic napkin incinerator, blue steel cabinet", width: 377, height: 311 },
    summary: "For lower-volume sanitary napkin disposal in schools, offices and shared washrooms.",
    badge: { label: "50% OFF", tone: "light" },
    highlight: false,
    specs: {
      dailyCapacity: "80–100/day",
      batchCapacity: "Not specified",
      power: "800 W",
      weight: "8kg",
      colours: "Blue / Pink",
      ...SHARED_SPECS,
    },
    sortOrder: 1,
  },
  {
    slug: "pro",
    name: "Pro",
    title: "Napkin Incinerator Machine (Pro)",
    shortName: "Pro napkin incinerator",
    price: 4500,
    originalPrice: 9000,
    discountPercent: 50,
    image: { src: "/images/product-pro.png", alt: "RMAX Pro napkin incinerator — white cabinet with blue trim on wheels", width: 256, height: 166 },
    cardImage: { src: "/images/home/card-pro.png", alt: "RMAX Pro napkin incinerator, blue steel cabinet", width: 377, height: 311 },
    summary: "For offices, clinics and institutions with higher daily sanitary disposal needs.",
    badge: { label: "RECOMMENDED", tone: "navy" },
    highlight: true,
    specs: {
      dailyCapacity: "200–250/day",
      batchCapacity: "4–6 at once",
      power: "1000 W",
      weight: "9kg",
      colours: "See supplied image",
      ...SHARED_SPECS,
    },
    sortOrder: 2,
  },
  {
    slug: "pro-max",
    name: "Pro-Max",
    title: "Napkin Incinerator Machine (Pro-Max)",
    shortName: "Pro-Max napkin incinerator",
    price: 6500,
    originalPrice: 13000,
    discountPercent: 50,
    image: { src: "/images/product-pro-max.png", alt: "RMAX Aura Pro-Max napkin incinerator — silver steel cabinet", width: 256, height: 166 },
    cardImage: { src: "/images/home/card-pro-max.png", alt: "RMAX Pro-Max napkin incinerator, blue steel cabinet", width: 377, height: 311 },
    summary: "For high-traffic public washrooms, campuses and institutional facilities.",
    badge: { label: "NEW", tone: "green" },
    highlight: false,
    specs: {
      dailyCapacity: "400–500/day",
      batchCapacity: "6–8 at once",
      power: "1200 W",
      weight: "10kg",
      colours: "See supplied image",
      ...SHARED_SPECS,
    },
    sortOrder: 3,
  },
];

/* ---------- Product detail content (from the Product Detail design) ---------- */

const GALLERY: IGalleryItem[] = [
  { src: "/images/products/gallery-main.png", thumb: "/images/products/gallery-thumb-1.png", alt: "Front view of the blue incinerator", kind: "image" },
  { src: "/images/products/gallery-thumb-2.png", thumb: "/images/products/gallery-thumb-2.png", alt: "Side view with power cable", kind: "image" },
  { src: "/images/products/gallery-thumb-3.png", thumb: "/images/products/gallery-thumb-3.png", alt: "Control panel close-up", kind: "image" },
  { src: "/images/products/gallery-thumb-4.png", thumb: "/images/products/gallery-thumb-4.png", alt: "Open combustion chamber", kind: "image" },
  { src: "/images/products/gallery-thumb-5.png", thumb: "/images/products/gallery-thumb-5.png", alt: "Product video", kind: "video" },
];

const INTRO =
  "A Napkin Incinerator is an electric hygiene solution for safe disposal of used napkins. It incinerates menstrual waste into sterile ash, eliminating odor and bacteria, and maintaining washroom cleanliness.";

const AUDIENCE: Record<string, string> = {
  basic: "lower-volume sanitary napkin disposal in schools, offices and shared washrooms",
  pro: "institutions with higher daily sanitary disposal needs",
  "pro-max": "high-traffic public washrooms, campuses and institutional facilities",
};

const overviewFor = (slug: string, name: string) =>
  `The RMAX ${name} Napkin Incinerator is designed for ${AUDIENCE[slug]}. It offers a reliable, hygienic and low-odour solution for offices, clinics, schools and public facilities. Built with durable materials and safety features, it ensures efficient disposal with minimal maintenance.`;

const featuresFor = (batch: string): IDetailPoint[] => [
  {
    icon: "flame",
    title: "Efficient burning",
    body: batch === "Not specified" ? "Controlled combustion for efficient pad disposal." : `Handles ${batch.replace(" at once", "")} pads at once with controlled combustion.`,
  },
  { icon: "settings", title: "Safe & reliable", body: "Built with safety cut-offs and overheat protection." },
  { icon: "leaf", title: "Low odour operation", body: "Designed for indoor institutional use." },
  { icon: "wrench", title: "Low maintenance", body: "Durable build for long service life." },
];

const APPLICATIONS: IDetailPoint[] = [
  { icon: "school", title: "Schools", body: "For students and staff" },
  { icon: "hospital", title: "Clinics & Hospitals", body: "For patient and staff washrooms" },
  { icon: "office", title: "Offices", body: "For workplace facilities" },
  { icon: "institution", title: "Public Institutions", body: "For high footfall locations" },
];

function techSpecsFor(name: string, s: IProductSpecs): { label: string; value: string }[] {
  const batch = s.batchCapacity === "Not specified" ? "Not specified" : s.batchCapacity.replace(" at once", "");
  return [
    { label: "Model", value: name },
    { label: "Power", value: s.power },
    { label: "Capacity (pads / day)", value: s.dailyCapacity.replace("/day", "") },
    { label: "Burning at once", value: batch },
    { label: "Weight", value: s.weight.replace("kg", " kg") },
    { label: "Dimensions (H × W × D)", value: "650 × 400 × 300 mm" },
    { label: "Colours", value: s.colours === "See supplied image" ? "Blue / Pink" : s.colours },
    { label: "Power supply", value: "220 V, 50 Hz" },
    { label: "Body material", value: "Mild steel with powder coating" },
    { label: "Installation", value: "Wall mount / Floor stand" },
    { label: "Warranty", value: s.warranty },
  ];
}

const PORTRAITS: Record<string, IImage> = {
  basic: { src: "/images/products/portrait-basic.png", alt: "RMAX Basic napkin incinerator, white and blue unit", width: 262, height: 310 },
  pro: { src: "/images/products/portrait-pro.png", alt: "RMAX Pro napkin incinerator, white cabinet on wheels", width: 261, height: 310 },
  "pro-max": { src: "/images/products/portrait-pro-max.png", alt: "RMAX Pro-Max napkin incinerator, silver steel cabinet", width: 262, height: 310 },
};

const LIST_IMAGES: Record<string, IImage> = {
  basic: { src: "/images/products/list-basic.png", alt: "RMAX Basic napkin incinerator, blue steel cabinet", width: 270, height: 311 },
  pro: { src: "/images/products/list-pro.png", alt: "RMAX Pro napkin incinerator, blue steel cabinet", width: 270, height: 311 },
  "pro-max": { src: "/images/products/list-pro-max.png", alt: "RMAX Pro-Max napkin incinerator, blue steel cabinet", width: 270, height: 311 },
};

const MODEL_GALLERIES: Record<string, IGalleryItem[]> = {
  basic: [
    { src: "/images/products/list-basic.png", thumb: "/images/products/list-basic.png", alt: "RMAX Basic napkin incinerator front view", kind: "image" },
    { src: "/images/products/portrait-basic.png", thumb: "/images/products/portrait-basic.png", alt: "RMAX Basic napkin incinerator portrait angle", kind: "image" },
    { src: "/images/product-basic.png", thumb: "/images/product-basic.png", alt: "RMAX Basic napkin incinerator studio view", kind: "image" },
    { src: "/images/products/gallery-thumb-3.png", thumb: "/images/products/gallery-thumb-3.png", alt: "Control panel close-up", kind: "image" },
    { src: "/images/products/gallery-thumb-4.png", thumb: "/images/products/gallery-thumb-4.png", alt: "Open combustion chamber", kind: "image" },
  ],
  pro: [
    { src: "/images/products/gallery-main.png", thumb: "/images/products/gallery-thumb-1.png", alt: "Front view of the Pro blue incinerator", kind: "image" },
    { src: "/images/products/list-pro.png", thumb: "/images/products/list-pro.png", alt: "RMAX Pro incinerator cabinet view", kind: "image" },
    { src: "/images/products/portrait-pro.png", thumb: "/images/products/portrait-pro.png", alt: "RMAX Pro incinerator on wheels", kind: "image" },
    { src: "/images/products/gallery-thumb-2.png", thumb: "/images/products/gallery-thumb-2.png", alt: "Side view with power cable", kind: "image" },
    { src: "/images/products/gallery-thumb-3.png", thumb: "/images/products/gallery-thumb-3.png", alt: "Control panel close-up", kind: "image" },
    { src: "/images/products/gallery-thumb-4.png", thumb: "/images/products/gallery-thumb-4.png", alt: "Open combustion chamber", kind: "image" },
    { src: "/images/products/gallery-thumb-5.png", thumb: "/images/products/gallery-thumb-5.png", alt: "Product video", kind: "video" },
  ],
  "pro-max": [
    { src: "/images/products/list-pro-max.png", thumb: "/images/products/list-pro-max.png", alt: "RMAX Pro-Max heavy-duty napkin incinerator", kind: "image" },
    { src: "/images/products/portrait-pro-max.png", thumb: "/images/products/portrait-pro-max.png", alt: "RMAX Pro-Max silver steel cabinet", kind: "image" },
    { src: "/images/products/promax-transparent.png", thumb: "/images/products/promax-transparent.png", alt: "RMAX Pro-Max high-capacity unit", kind: "image" },
    { src: "/images/product-pro-max.png", thumb: "/images/product-pro-max.png", alt: "RMAX Pro-Max studio angle", kind: "image" },
    { src: "/images/products/gallery-thumb-3.png", thumb: "/images/products/gallery-thumb-3.png", alt: "Digital control panel close-up", kind: "image" },
    { src: "/images/products/gallery-thumb-4.png", thumb: "/images/products/gallery-thumb-4.png", alt: "Open high-temperature combustion chamber", kind: "image" },
  ],
};

const PAD_VENDING_GALLERY: IGalleryItem[] = [
  { src: "/images/products/pad-vending.png", thumb: "/images/products/pad-vending.png", alt: "RMAX Sanitary Pad Vending Machine wall mount", kind: "image" },
  { src: "/images/products/hero-lineup.png", thumb: "/images/products/hero-lineup.png", alt: "RMAX sanitary vending machines lineup", kind: "image" },
];

const OVERVIEW_IMAGES: Record<string, IImage> = {
  basic: {
    src: "/images/products/list-basic.png",
    alt: "RMAX Basic incinerator compact washroom setup",
    width: 641,
    height: 276,
  },
  pro: {
    src: "/images/products/overview.png",
    alt: "RMAX Pro incinerator mounted on a washroom wall beside a basin",
    width: 641,
    height: 276,
  },
  "pro-max": {
    src: "/images/products/list-pro-max.png",
    alt: "RMAX Pro-Max high-capacity institutional incinerator",
    width: 641,
    height: 276,
  },
  "pad-vending-coin": {
    src: "/images/products/pad-vending.png",
    alt: "RMAX Sanitary Pad Vending Machine mounted on a washroom wall",
    width: 641,
    height: 276,
  },
};

const OVERVIEW_IMAGE: IImage = OVERVIEW_IMAGES.pro;

/** Incinerators, enriched with the detail-page content. */
const incinerators: IProduct[] = baseProducts.map((p) => ({
  ...p,
  category: "incinerator",
  colours: p.slug === "basic" ? ["blue", "pink"] : p.slug === "pro" ? ["blue", "pink"] : ["blue"],
  portraitImage: PORTRAITS[p.slug],
  listImage: LIST_IMAGES[p.slug],
  mrp: p.slug === "pro" ? 9570 : p.originalPrice || undefined,
  intro: INTRO,
  overview: overviewFor(p.slug, p.name),
  overviewImage: OVERVIEW_IMAGES[p.slug] || OVERVIEW_IMAGE,
  gallery: MODEL_GALLERIES[p.slug] || GALLERY,
  features: featuresFor(p.specs.batchCapacity),
  applications: APPLICATIONS,
  techSpecs: techSpecsFor(p.name, p.specs),
}));

/** Fourth catalogue item, shown in Related products and under "Pad vending machines". */
const padVending: IProduct = {
  category: "pad-vending",
  colours: ["off-white"],
  slug: "pad-vending-coin",
  name: "Pad Vending",
  title: "Sanitary Pad Vending Machine (Automatic, Manual & Push Button)",
  shortName: "Pad vending machine",
  price: 8500,
  originalPrice: 12000,
  discountPercent: 29,
  mrp: 12000,
  image: { src: "/images/products/pad-vending.png", alt: "Sanitary pad vending machine mounted on a wall", width: 380, height: 240 },
  cardImage: { src: "/images/products/pad-vending.png", alt: "Sanitary pad vending machine mounted on a wall", width: 380, height: 240 },
  chips: ["Automatic", "Manual", "Push Button (Free)", "Wall mount"],
  summary: "Wall-mounted sanitary pad vending machine available in Automatic, Manual, and Push-button (instant free dispensing with no money needed) configurations.",
  overview: "The RMAX Sanitary Pad Vending Machine offers rapid, hygienic dispensing in institutions, schools, colleges, and workplaces. Available in Automatic, Manual turn, and Push-button (free dispensing without money) configurations, ensuring complete convenience.",
  overviewImage: OVERVIEW_IMAGES["pad-vending-coin"],
  gallery: PAD_VENDING_GALLERY,
  features: [
    { icon: "settings", title: "3 Dispensing Modes", body: "Available in Automatic (sensor/coin), Manual (twist knob), and Push Button (instant free dispensing)." },
    { icon: "shield", title: "100% Made in India", body: "Manufactured in-house with high-grade Indian engineering." },
    { icon: "wrench", title: "1 Year Warranty", body: "Piece-to-piece replacement for defects. Spare parts available after warranty." },
    { icon: "leaf", title: "Low Maintenance", body: "Jam-free dispensing mechanism with high pad capacity." },
  ],
  applications: APPLICATIONS,
  specs: {
    dailyCapacity: "High capacity (100+ pads)",
    batchCapacity: "Single / Multi Dispense",
    power: "Push-button / Manual (no power needed) or Automatic (mains)",
    weight: "Lightweight wall-mount",
    colours: "Off-white",
    cycleDuration: "Instant dispensing",
    chamber: "Stainless steel mechanism",
    maintenance: "Low maintenance · Made in India",
    warranty: "1 year warranty · Piece-to-piece return",
    delivery: "3–5 days · Free shipping · Max 5 direct",
  },
  techSpecs: [
    { label: "Model", value: "Sanitary Pad Vending Machine" },
    { label: "Operation Types", value: "Automatic, Manual & Push Button (No money required)" },
    { label: "Installation", value: "Wall mount" },
    { label: "Direct Order Limit", value: "Max 5 units (Bulk via mukesh@rmaxelectro.com)" },
    { label: "Warranty", value: "1 year (Piece-to-piece replacement)" },
    { label: "Manufacturing", value: "100% Made in India" },
    { label: "Post-Warranty Support", value: "Repairing parts & service available" },
    { label: "Return Condition", value: "Physical damage non-returnable" },
  ],
  sortOrder: 4,
};

export const products: IProduct[] = [...incinerators, padVending];

/** Trust row under the product price card. */
export const productTrust = [
  { icon: "shield", title: "1 year warranty", body: "Piece-to-piece return for defects" },
  { icon: "truck", title: "100% Made in India", body: "PAN India delivery & in-house manufacturing" },
  { icon: "cog", title: "Post-warranty support", body: "Repairing parts available after warranty" },
];

export const faqItems: IFaqItem[] = [
  {
    category: "Selection",
    question: "What types of sanitary pad vending machines are available?",
    answer:
      "RMAX provides 3 distinct vending machine types: 1) Automatic (sensor/coin operated), 2) Manual (turn-knob dispensing), and 3) Push Button (push button vending machine where no money/coins are needed—just press the button for automatic dispensing).",
    sortOrder: 1,
  },
  {
    category: "Delivery",
    question: "What is the maximum quantity for direct online orders?",
    answer:
      "Direct online checkout is capped at a maximum of 5 units. For bulk institutional orders of 6 or more units, please submit an institutional quote request or contact our team directly at mukesh@rmaxelectro.com for institutional pricing and delivery scheduling.",
    sortOrder: 2,
  },
  {
    category: "Exchanges",
    question: "What is the return and replacement policy?",
    answer:
      "We offer a piece-to-piece return and replacement policy for any unit with manufacturing defects during the 1-year warranty period. Units with physical damage, mishandling, or improper installation are strictly non-returnable.",
    sortOrder: 3,
  },
  {
    category: "Warranty",
    question: "Are repairing parts available after the 1-year warranty ends?",
    answer:
      "Yes. All RMAX machines come with a 1-year warranty on manufacturing defects. Even after the warranty ends, genuine repairing spare parts and maintenance support are readily available directly from our manufacturing facility.",
    sortOrder: 4,
  },
  {
    category: "Service",
    question: "Where are RMAX machines manufactured?",
    answer:
      "All RMAX incinerators and vending machines are 100% Made in India in our own manufacturing facility with high-grade Indian engineering and quality control.",
    sortOrder: 5,
  },
  {
    category: "Operation",
    question: "How does the incinerator operate?",
    answer:
      "Each model uses an enclosed high-temperature chamber for sanitary napkin disposal. Supplied cycle duration is 3–4 minutes. Follow the operating instructions provided with your unit.",
    sortOrder: 6,
  },
  {
    category: "Selection",
    question: "Which incinerator model is right for my institution?",
    answer:
      "Basic: 80–100/day. Pro: 200–250/day, 4–6 at once. Pro-Max: 400–500/day, 6–8 at once. Choose around your expected usage; request help if you are unsure.",
    sortOrder: 7,
  },
  {
    category: "Delivery",
    question: "When will my order arrive?",
    answer:
      "The supplied delivery window is 3–5 days across India, with free shipping. Use your order detail page for delivery updates, or send an enquiry through the contact form.",
    sortOrder: 8,
  },
];

const DRAFT_NOTICE = {
  title: "Draft for review",
  body: "This is proposed website copy. Policy details and legal wording need business and legal review before publication.",
};

export const policyPages: IPolicyPage[] = [
  {
    slug: "shipping-exchanges-warranty",
    eyebrow: "SHIPPING, EXCHANGES & WARRANTY",
    title: "Support for your purchase.",
    lead: "Free shipping · 1 year warranty · Piece-to-piece return for defects · Post-warranty spare parts · 100% Made in India.",
    draftNotice: DRAFT_NOTICE,
    sections: [
      {
        id: "shipping-delivery",
        title: "Shipping & delivery",
        body: "RMAX Solutions provides free shipping across India with an estimated 3–5 day delivery window. Direct online orders are capped at a maximum of 5 units. For bulk institutional orders (6+ units), please submit an inquiry or email mukesh@rmaxelectro.com to coordinate logistics and site delivery.",
      },
      {
        id: "receiving-your-order",
        title: "Receiving your order",
        body: "Use the order detail page for available delivery updates. When contacting support about delivery, include your order reference, model and delivery location. Inspect the packaging upon receipt and report any transit damage immediately.",
      },
      {
        id: "exchange-only-policy",
        title: "Piece-to-piece return & exchange policy",
        body: "We provide piece-to-piece return and replacement for any unit with manufacturing defects. Physical damage, vandalism, mishandling, or incorrect power supply connections are strictly non-returnable. Please contact mukesh@rmaxelectro.com with your order reference and photos/videos of the defect to initiate an exchange.",
      },
      {
        id: "requesting-an-exchange",
        title: "Requesting an exchange",
        body: "Contact service at mukesh@rmaxelectro.com with your order reference and reason. Our support team will confirm pickup arrangements, inspect the returned unit for absence of physical damage, and dispatch a replacement unit under our piece-to-piece defect policy.",
      },
      {
        id: "1-year-warranty",
        title: "1 year warranty & post-warranty parts",
        body: "Every RMAX machine is backed by a 1-year warranty covering manufacturing defects. After the 1-year warranty expires, RMAX provides full repairing parts support and replacement components to ensure your machines continue running reliably for years to come.",
      },
      {
        id: "installation-service",
        title: "100% Made in India & service support",
        body: "All RMAX machines are designed and manufactured 100% in India. Our support and technical team provide complete post-sale support, user manuals, and genuine spare parts across India.",
      },
      {
        id: "need-help-with-an-order",
        title: "Need help with an order or bulk inquiry?",
        body: "For support, piece-to-piece exchange, or bulk institutional quotes exceeding 5 units, reach out to mukesh@rmaxelectro.com or use our institutional quote request form.",
      },
    ],
  },
  {
    slug: "privacy-policy",
    eyebrow: "PRIVACY POLICY",
    title: "Your information, explained.",
    lead: "A readable draft of the website’s privacy notice, ready for review against the actual data practices before launch.",
    draftNotice: DRAFT_NOTICE,
    sections: [
      {
        id: "about-this-draft",
        title: "About this draft",
        body: "This proposed Privacy Policy describes information requested by the RMAX Solutions website designs. It is not an approved statement of current data practices. Before publication, RMAX Solutions should confirm its legal identity, privacy contact process, actual technology providers and applicable obligations. No certification or compliance claim is made here.",
      },
      {
        id: "information-you-provide",
        title: "Information you provide",
        body: "The proposed forms request contact details, organization information, product and installation requirements, order references, and billing or shipping details. Account forms request an email and password. Only provide information relevant to your enquiry or purchase. Avoid including sensitive personal information or full payment details in contact and service messages.",
      },
      {
        id: "how-information-may-be-used",
        title: "How information may be used",
        body: "Proposed purposes include responding to sales and service enquiries, preparing institutional quotes, handling orders and delivery, and maintaining the account details you choose to save. Any marketing use, additional processing purpose or automated decision-making should be separately assessed and accurately disclosed before the site is launched.",
      },
      {
        id: "service-providers-sharing",
        title: "Service providers & sharing",
        body: "Order fulfilment may require appropriate information to be shared with delivery, payment or website service providers. The actual providers, data categories, contractual safeguards and any cross-border arrangements must be confirmed before this wording is approved. This draft does not state that a particular provider is used or that data is never shared.",
      },
      {
        id: "cookies-website-technology",
        title: "Cookies & website technology",
        body: "The final notice should describe the cookies and similar technologies actually used by the published site, including account and cart functions and any analytics. Non-essential technology choices and consent controls, if required, need review. This static website design does not establish which cookies or tracking tools are implemented.",
      },
      {
        id: "retention-security",
        title: "Retention & security",
        body: "Information should be kept only for confirmed business and legal purposes, using appropriate safeguards. Specific retention periods, deletion procedures, access controls and security practices need review against the actual website implementation. No absolute security guarantee, retention schedule or unprovided technical protection is promised here.",
      },
      {
        id: "your-requests-contact",
        title: "Your requests & contact",
        body: "Use the Contact Us form to raise a privacy question or request a correction to your information. Available access, deletion or other rights depend on the applicable rules and the confirmed circumstances. Identity verification, response procedures and a formal privacy contact route must be approved before publication. Do not send your password in a request.",
      },
      {
        id: "updates-to-this-policy",
        title: "Updates to this policy",
        body: "The approved policy should carry a real effective date and describe how material changes will be communicated. An effective date is deliberately not assigned to this review draft. Please read the final policy published with the live website rather than relying on these proposed design-stage statements.",
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    eyebrow: "TERMS & CONDITIONS",
    title: "A clear basis for your purchase.",
    lead: "Proposed website terms covering products, orders and support. Business and legal review is required before publication.",
    draftNotice: DRAFT_NOTICE,
    sections: [
      {
        id: "scope-review-status",
        title: "Scope & review status",
        body: "These are proposed terms for the RMAX Solutions website and its sanitary napkin incinerator range. They are a design-stage draft, not approved legal terms. The seller’s legal identity, contract formation process, effective date and applicable law must be confirmed by the business and reviewed before publication.",
      },
      {
        id: "products-supplied-specifications",
        title: "Products & supplied specifications",
        body: "The range shown is Basic, Pro and Pro-Max. Review model capacity, power, weight and any supplied batch information before ordering. The website’s original product images are retained for each model. Confirm any site-specific suitability, installation requirements or product questions with the team; this draft does not add regulatory, environmental or certification promises.",
      },
      {
        id: "prices-launch-offers",
        title: "Prices & launch offers",
        body: "Supplied launch prices are Basic ₹3,000 (original ₹6,000), Pro ₹4,500 (original ₹9,000), and Pro-Max ₹6,500 (original ₹13,000), representing 50% launch offers. Offer duration and the treatment of applicable invoice charges need confirmation before publication. No tax rate is assumed in these website designs.",
      },
      {
        id: "orders-quotes-payment",
        title: "Orders, quotes & payment",
        body: "Check your model, quantity, institutional details and shipping information before submitting an order. A quote request is for discussing requirements; it is not presented here as a completed purchase. Accepted payment methods, order acceptance, cancellation and correction procedures require review. Sample order RMAX-DEMO-001 is illustrative and does not represent a real transaction.",
      },
      {
        id: "delivery-exchanges-warranty",
        title: "Delivery, exchanges & warranty",
        body: "Supplied purchase benefits include free shipping, 3–5 day delivery and a 1 year warranty. The supplied policy is exchange only. Read Shipping, Exchanges & Warranty and contact Service with your order reference for support. Eligibility, limitations and process details must be finalized before these terms are approved; no additional refund right is invented by this draft.",
      },
      {
        id: "installation-responsible-use",
        title: "Installation & responsible use",
        body: "Discuss placement and institutional installation needs before purchase, and follow the instructions supplied with the machine. Use the service contact form for operational questions. Specific electrical, ventilation, servicing and site requirements have not been supplied and should be confirmed with RMAX Solutions rather than inferred from the website design.",
      },
      {
        id: "accounts-website-use",
        title: "Accounts & website use",
        body: "If you create an account, provide accurate information and keep your password private. Guest checkout is also shown as an option. Do not misuse forms, attempt unauthorized access or submit confidential payment information through support messages. The final account administration and acceptable-use provisions require review against the actual website functionality.",
      },
      {
        id: "privacy-support",
        title: "Privacy & support",
        body: "The Privacy Policy draft describes the information requested by the proposed forms and highlights practices that need confirmation. Contact Us provides sales and service enquiry routes. Use those forms for product, order or website questions without including your password or unnecessary personal information.",
      },
      {
        id: "legal-provisions-to-finalize",
        title: "Legal provisions to finalize",
        body: "Liability, statutory rights, intellectual property, dispute handling, jurisdiction and changes to these terms must be drafted for the confirmed seller and applicable law. These provisions are intentionally not invented or presented as approved. The final published terms should clearly state the agreed legal position and must not remove rights that cannot lawfully be excluded.",
      },
    ],
  },
];

/** Home page — numbers strip, review summary and testimonials (verbatim from the Home design). */
export const homeStats = [
  { value: "20K+", label: "Happy clients" },
  { value: "1,000+", label: "Projects done" },
  { value: "14+ yrs", label: "Experience" },
  { value: "100%", label: "Quality checked" },
];

/** `rating` is the number shown; `stars` is how many stars are filled (the design shows 4½). */
export const reviewSummary = { rating: "4.8", stars: 4.5, label: "from 2300+ verified reviews" };

export const testimonials: ITestimonial[] = [
  {
    name: "Balbir Singhania",
    role: "Principle, Singhaniya School, Jaipur",
    quote: "Our campus needed a hygienic disposal solution for 1,500+ students. RMAX delivered and supported it end to end.",
    rating: 5,
    dateLabel: "October 2025",
    featured: true,
    product: "Basic",
    image: { src: "/images/home/testimonial-basic-clean.png", alt: "RMAX Basic napkin incinerator in a bright washroom", width: 483, height: 460 },
    sortOrder: 0,
  },
  {
    name: "Dr. Ananya Rao",
    role: "Director, CareFirst Hospital, Bengaluru",
    quote: "We placed the Pro-Max across three campus washrooms. Zero odour, quiet operation and the RMAX team supported us at every step.",
    rating: 5,
    dateLabel: "October 2025",
    featured: false,
    sortOrder: 1,
  },
  {
    name: "Rajesh Khanna",
    role: "Facilities Head, Northfield College, Jaipur",
    quote: "Reliable machine for our clinic. The Pro model burns cleanly and the service response has been quick.",
    rating: 5,
    dateLabel: "October 2025",
    featured: false,
    sortOrder: 2,
  },
  {
    name: "Dr. Meera Iyer",
    role: "Principal, Sunrise Public School, Pune",
    quote: "The Basic unit handles our daily load without any fuss. Installation took under an hour and the students are comfortable using it.",
    rating: 5,
    dateLabel: "October 2025",
    featured: false,
    sortOrder: 3,
  },
  {
    name: "Sunil Deshmukh",
    role: "Admin Officer, Apex Health Diagnostics, Mumbai",
    quote: "Very impressed with the ceramic chamber and smoke filter. Keeps our washroom premises clean, odour-free and completely compliant.",
    rating: 5,
    dateLabel: "November 2025",
    featured: false,
    sortOrder: 4,
  },
];


/** Demo account + order shown on the My Account / My Orders / Order Detail designs. */
export const demoUser = {
  name: "Asha Rao",
  email: "facilities@example.org",
  organization: "Sample Campus",
  phone: undefined as string | undefined,
  shippingAddress: {
    organization: "Sample Campus",
    recipient: "Asha Rao",
    department: "Facilities team",
    street: "Building A, Example Road",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411001",
    country: "India",
  },
};

export const demoOrder = {
  reference: "RMAX-DEMO-001",
  placedAt: new Date(Date.UTC(2026, 9, 8, 9, 0, 0)), // 08 Oct 2026
  productSlug: "pro",
  quantity: 1,
};
