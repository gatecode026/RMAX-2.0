import type { Metadata } from "next";
import Image from "next/image";
import {
  Building2,
  ClipboardCheck,
  Handshake,
  Hospital,
  Landmark,
  School,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getHomeStats, getProducts } from "@/lib/data/content";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "RMAX Solutions is an Indian manufacturer and OEM supplier of sanitary waste disposal, pad vending systems and smart service hardware.",
};

const wrap = "mx-auto w-full max-w-(--container-page) px-5 sm:px-8 xl:px-0";
const h2 = "text-[28px]/9 font-extrabold tracking-[-0.01em] text-charcoal md:text-[36px]/[44px]";
const lead = "text-body text-muted";
const card = "rounded-[28px] border border-line bg-card";

const SPACES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: School, title: "Schools & campuses", body: "Pad access and sanitary disposal for students, staff and shared campus washrooms." },
  { icon: Hospital, title: "Clinics & hospitals", body: "Practical hygiene equipment for patient and staff washroom facilities." },
  { icon: Building2, title: "Offices & workplaces", body: "Everyday washroom solutions for employees and the teams who manage their facilities." },
  { icon: Landmark, title: "Public institutions", body: "Equipment choices for shared public washrooms and higher-footfall locations." },
];

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: SlidersHorizontal,
    title: "Fit before features.",
    body: "Daily usage, available space and operating needs guide the choice of equipment. Compare capacity and specifications, not just price.",
  },
  {
    icon: ClipboardCheck,
    title: "Clarity at every step.",
    body: "Understand the model, installation requirements and routine care before ordering, so your facility team knows what to expect.",
  },
  {
    icon: Handshake,
    title: "Support beyond supply.",
    body: "From product selection to after-sales questions, our approach keeps the needs of the institution and its users at the centre.",
  },
];

const STEPS = [
  { title: "Choose with confidence", body: "Share your facility type and daily usage. We help you compare models, capacity and pricing." },
  { title: "Plan for installation", body: "Discuss placement, power and installation needs before bringing equipment into your facility." },
  { title: "Keep everyday use simple", body: "Get guidance on operation and routine care so your team can manage the equipment confidently." },
  { title: "Stay supported after purchase", body: "Contact the team for after-sales queries, troubleshooting and warranty information." },
];

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden className="grid size-12 place-items-center rounded-[12px] bg-soft text-navy">
      <Icon className="size-[22px]" strokeWidth={1.6} />
    </span>
  );
}

export default async function AboutUsPage() {
  const [stats, products] = await Promise.all([getHomeStats(), getProducts()]);
  const tiers = products.map((p) => p.name).join(" · ");

  return (
    <>
      {/* Hero */}
      <section className="bg-[linear-gradient(90deg,#EAF0F8_0%,#FDFDFD_100%)] pb-[42px] pt-10 md:pt-[56px]">
        <div className={wrap}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_616px] lg:gap-12">
            <div>
              <h1 className="text-[40px]/[48px] font-extrabold tracking-[-0.01em] text-charcoal md:text-[52px]/[64px]">About RMAX Solutions.</h1>
              <p className="mt-6 max-w-[590px] text-[22px]/8 font-bold text-charcoal md:text-[28px]/9">
                Smart hygiene. Built around the people who use it.
              </p>
              <p className="mt-6 max-w-[580px] text-body text-muted md:text-[20px]/8">
                We are an Indian manufacturer and OEM supplier of sanitary waste disposal, pad vending systems and smart service hardware. We
                help institutions make everyday hygiene more accessible, practical and easier to manage.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact-us" className="h-12 px-6">
                  Contact our team
                </ButtonLink>
                <ButtonLink href="/our-product" variant="outline" className="h-12 px-6">
                  View all products
                </ButtonLink>
              </div>
            </div>

            <figure className={cn(card, "overflow-hidden lg:mt-[10px]")}>
              <Image
                src="/images/about/hero.png"
                alt="RMAX range: a red napkin incinerator, a blue pad vending machine and a floral pad dispenser on stone plinths"
                width={615}
                height={317}
                priority
                className="aspect-[615/317] w-full object-cover"
              />
              <figcaption className="px-6 py-5">
                <p className="text-body font-bold text-charcoal">Practical solutions for shared spaces.</p>
                <p className="mt-1 text-body-sm text-muted md:text-body">From sanitary disposal to pad access, designed for institutional needs.</p>
              </figcaption>
            </figure>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6" aria-label="RMAX in numbers">
            {stats.map((s) => (
              <li key={s.label} className={cn(card, "rounded-[24px] px-6 py-5")}>
                <p className="font-heading text-[30px]/9 font-extrabold text-charcoal md:text-[40px]/[48px]">{s.value}</p>
                <p className="text-body text-muted md:text-[20px]/7">{s.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mission + approach */}
      <section className="bg-card py-12 md:py-16">
        <div className={cn(wrap, "grid items-center gap-10 lg:grid-cols-[1fr_640px] lg:gap-20")}>
          <div>
            <h2 className={h2}>Better hygiene starts with everyday access.</h2>
            <p className="mt-6 max-w-[560px] text-body text-muted">
              A shared washroom should support the dignity and comfort of every person who uses it. For institutions, that means making
              sanitary products available and providing a clear, dependable way to dispose of used pads.
            </p>
            <p className="mt-6 max-w-[560px] text-body text-muted">
              RMAX Solutions brings equipment and practical guidance together, helping facility teams choose solutions that fit their spaces
              and daily needs.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] bg-navy px-7 py-7 text-white">
              <h3 className="text-title text-white">Our mission.</h3>
              <p className="mt-3 text-body text-white">
                To make institutional hygiene simpler through accessible products, reliable disposal equipment and support that extends
                beyond the purchase.
              </p>
            </div>
            <div className={cn(card, "px-7 py-7")}>
              <h3 className="text-title">Our approach.</h3>
              <p className="mt-3 text-body text-muted">
                Start with the facility, not just the machine. Understand usage, compare the right capacity and plan for everyday operation
                before recommending a solution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="bg-soft py-12 md:py-16">
        <div className={wrap}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className={h2}>The right equipment. A clearer choice.</h2>
              <p className={cn(lead, "mt-4 max-w-[900px]")}>
                Our portfolio connects sanitary disposal and pad access with the wider hardware needs of businesses and institutions.
              </p>
            </div>
            <ButtonLink href="/our-product" variant="outline" className="h-12 px-6">
              View all products →
            </ButtonLink>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                img: { src: "/images/about/incinerator.png", alt: "RMAX blue napkin incinerator", w: 280 },
                title: "Sanitary napkin incinerators.",
                body: "Basic, Pro and Pro-Max models for different daily disposal needs, from lower-volume washrooms to high-traffic institutional facilities.",
                tags: tiers || "Basic · Pro · Pro-Max",
              },
              {
                img: { src: "/images/about/vending.png", alt: "Wall-mounted coin-operated sanitary pad vending machine", w: 480 },
                title: "Sanitary pad vending machines.",
                body: "Convenient access to sanitary pads in shared washrooms. Coin-operated equipment supports a practical, self-service approach to pad availability.",
                tags: "Coin-operated · Wall mount",
              },
            ].map((c) => (
              <article key={c.title} className={cn(card, "p-4")}>
                <div className="flex h-[320px] items-end justify-center overflow-hidden rounded-[16px] bg-soft">
                  <Image src={c.img.src} alt={c.img.alt} width={c.img.w} height={320} className="h-[320px] w-auto max-w-full object-cover" />
                </div>
                <div className="px-2 pt-6 pb-2 md:px-6">
                  <h3 className="text-[22px]/8 font-extrabold text-charcoal md:text-[24px]/8">{c.title}</h3>
                  <p className="mt-3 text-body text-muted">{c.body}</p>
                  <p className="mt-4 text-body font-bold text-navy">{c.tags}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={cn(card, "mt-8 grid items-center gap-3 px-6 py-6 md:grid-cols-[352px_1fr] md:gap-0")}>
            <h3 className="text-[22px]/8 font-extrabold text-charcoal md:text-[24px]/8">Smart service hardware.</h3>
            <p className="text-body text-muted">
              We also supply GPS trackers (KIOSK banking) and smart service hardware. Talk to our team about product fit, specifications and
              your application.
            </p>
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section className="bg-card py-12 md:py-16">
        <div className={wrap}>
          <h2 className={h2}>Built for the spaces people share.</h2>
          <p className={cn(lead, "mt-3 max-w-[900px]")}>
            Different facilities have different routines. We help match hygiene equipment to the people, spaces and usage patterns it needs to
            support.
          </p>
          <ul className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SPACES.map((s) => (
              <li key={s.title} className={cn(card, "p-6")}>
                <IconTile icon={s.icon} />
                <h3 className="mt-[18px] font-sans text-body font-bold text-charcoal">{s.title}</h3>
                <p className="mt-4 text-body text-muted">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-canvas py-12 md:py-16">
        <div className={wrap}>
          <h2 className={h2}>Practical thinking. From the start.</h2>
          <p className={cn(lead, "mt-4")}>
            We focus on what makes a solution useful in everyday institutional life: the right fit, straightforward information and ongoing
            support.
          </p>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className={cn(card, "p-7")}>
                <IconTile icon={p.icon} />
                <h3 className="mt-5 text-[22px]/8 font-extrabold text-charcoal md:text-[24px]/8">{p.title}</h3>
                <p className="mt-3.5 text-body text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Help */}
      <section className="bg-card pt-12 md:pt-14">
        <div className={cn(wrap, "grid items-start gap-10 lg:grid-cols-[536px_1fr] lg:gap-16")}>
          <figure className="overflow-hidden rounded-[24px] border border-line lg:mt-7">
            <Image
              src="/images/about/washroom.png"
              alt="A washroom with a basin and a RMAX incinerator mounted on the wall"
              width={534}
              height={366}
              className="aspect-[534/366] w-full object-cover"
            />
            <figcaption className="bg-soft px-6 py-5">
              <p className="text-body font-bold text-charcoal">Equipment is only part of the solution.</p>
              <p className="mt-1 text-body text-muted">The right placement, use and care matter too.</p>
            </figcaption>
          </figure>

          <div>
            <h2 className={h2}>Here to help. Before and after you buy.</h2>
            <p className={cn(lead, "mt-6 max-w-[680px]")}>
              A considered choice today makes everyday operation easier tomorrow. Here is how we can help along the way.
            </p>
            <ol className="mt-6 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-soft text-body-sm font-bold text-navy">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-sans text-body font-bold text-charcoal">{s.title}</h3>
                    <p className="text-body text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card pt-14 pb-12 md:pt-[70px] md:pb-16">
        <div className={wrap}>
          <div className="grid items-center gap-6 rounded-[40px] bg-[linear-gradient(100deg,#002970_0%,#2F5995_100%)] px-6 py-8 text-white md:px-10 md:py-10 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div>
              <h2 className="text-[26px]/9 font-extrabold tracking-[-0.01em] text-white md:text-[32px]/10">
                Let’s find the right solution for your institution.
              </h2>
              <p className="mt-4 max-w-[900px] text-body text-white">
                Tell us about your space, daily usage and requirements. Our team can help with product fit, pricing, installation and
                after-sales support.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-center">
              <ButtonLink href="/institutional-quote" variant="dark" className="h-12 px-8">
                Discuss your requirements
              </ButtonLink>
              <p className="text-body text-white">For B2B &amp; institutional enquiries</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
