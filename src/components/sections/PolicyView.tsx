import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getPolicyPage } from "@/lib/data/content";

/** Long-form policy layout: hero, draft notice, sticky "On this page" TOC and sections matching Figma design. */
export async function PolicyView({ slug, breadcrumb }: { slug: string; breadcrumb: string }) {
  const page = await getPolicyPage(slug);
  if (!page) notFound();

  return (
    <div className="w-full -mb-16 md:-mb-24 pb-16 md:pb-24 pt-6 sm:pt-8 bg-[linear-gradient(90deg,#E1F5FF_0%,#FFFFFF_48%,#EAF1FF_100%)]">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 xl:px-0">
        {/* Page introduction matching Figma policy templates */}
        <div className="flex flex-col items-start gap-4.5 pt-2 pb-8 sm:pb-10">
          {/* Breadcrumb trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-[14px]">
            <Link href="/" className="text-[#64748B] hover:text-[#0B62FF] transition-colors">
              Home
            </Link>
            <ChevronRight className="size-4 text-[#64748B]" aria-hidden="true" />
            <span className="font-sans text-[12px] font-normal leading-4 text-[#0B62FF]" aria-current="page">
              {breadcrumb}
            </span>
          </nav>

          {/* Eyebrow */}
          <p className="font-sans text-[12px] font-extrabold leading-4 tracking-wider text-[#0B62FF] uppercase">
            {page.eyebrow}
          </p>

          {/* Heading & Description */}
          <div className="flex flex-col items-start gap-3.5 max-w-[940px]">
            <h1 className="font-jakarta text-[32px]/[38px] sm:text-[42px]/[48px] md:text-[52px]/[60px] font-extrabold tracking-[-1.5px] text-[#020618]">
              {page.title}
            </h1>
            <p className="font-sans text-[15px] sm:text-[16px]/[28px] text-[#62748E]">
              {page.lead}
            </p>
          </div>
        </div>

        {/* Draft notice banner */}
        <div className="w-full rounded-[24px] border border-[#94A3B8]/20 bg-white/70 backdrop-blur-xs px-7 py-5 shadow-xs">
          <p className="font-sans font-bold text-[14px] text-[#0F172A]">
            {page.draftNotice.title}
          </p>
          <p className="font-sans text-[14px]/[22px] text-[#62748E] mt-1">
            {page.draftNotice.body}
          </p>
        </div>

        {/* Content Grid: Left sidebar (276px) + Right content card (1fr) */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[276px_1fr]">
          {/* Left Sidebar: "On this page" */}
          <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5 lg:sticky lg:top-[calc(var(--header-height)+16px)]">
            <h2 className="font-jakarta font-extrabold text-[20px]/[24px] text-[#020618]">
              On this page
            </h2>
            <nav aria-label="On this page">
              <ul className="flex flex-col gap-2.5 font-sans text-[14px]">
                {page.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-[#62748E] hover:text-[#0B62FF] transition-colors leading-[20px] block py-0.5"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center h-[46px] w-full rounded-full bg-white border border-[#0B62FF]/25 text-[#0B62FF] font-sans font-bold text-[14px] leading-5 hover:bg-[#EFF6FF] transition-colors mt-2"
            >
              Contact support
            </Link>
          </div>

          {/* Right Content Card */}
          <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-8 sm:p-10 lg:p-12 shadow-sm flex flex-col gap-10">
            {page.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
                <h2
                  id={`${s.id}-h`}
                  className="font-jakarta font-extrabold text-[22px]/[28px] sm:text-[24px]/[30px] text-[#020618]"
                >
                  {s.title}
                </h2>
                <p className="font-sans text-[15px]/[26px] sm:text-[16px]/[28px] text-[#62748E] mt-3 whitespace-pre-line">
                  {s.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
