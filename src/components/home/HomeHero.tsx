import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { capacityRange } from "@/lib/home";
import { formatINR } from "@/lib/format";
import type { HomeStat, ProductDTO } from "@/lib/data/content";

/** Headline + hero card, then the four-number strip. */
export function HomeHero({ featured, stats }: { featured?: ProductDTO; stats: HomeStat[] }) {
  return (
    <section className="mx-auto w-full max-w-(--container-page) px-5 pt-4 sm:px-8 md:pt-8 lg:px-12 xl:px-16 xl:pt-[66px]">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_534px] lg:gap-8">
        <div>
          <h1 className="max-w-[620px] font-heading text-[44px]/[52px] font-extrabold tracking-[-1.5px] text-charcoal sm:text-[56px]/[64px] xl:text-[72px]/[84px]">
            Smart hygiene. Built for your institutions.
          </h1>
          <p className="mt-6 max-w-[590px] text-body text-muted md:mt-[38px] md:text-[20px]/8">
            RMAX Solutions is an Indian manufacturer and OEM supplier of sanitary waste disposal, pad vending systems and smart service
            hardware.
          </p>
          <div className="mt-6 flex flex-wrap gap-[13px]">
            <ButtonLink href="#best-sellers" className="h-[58px] px-8">
              Shop best sellers
            </ButtonLink>
            <ButtonLink href="/compare-models" variant="outline" className="h-[58px] px-8">
              View All Products
            </ButtonLink>
          </div>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-line/60 bg-card shadow-[0_12px_40px_rgb(0_41_112/0.08)] lg:mt-[15px]">
          <Image
            src="/images/home/hero.png"
            alt="RMAX Pro-Max incinerator mounted on a washroom wall"
            width={534}
            height={300}
            priority
            className="h-[300px] w-full object-cover"
          />
          {featured && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-4 pt-[15px]">
              <div className="min-w-[242px] rounded-[20px] bg-charcoal px-5 py-4 text-white">
                <p className="text-body-sm text-muted-dark">Burning capacity</p>
                <p className="font-heading text-[36px]/11 font-extrabold">{capacityRange(featured.specs.dailyCapacity)}</p>
              </div>
              <div>
                <p className="text-body-sm text-muted">{featured.name} incinerator</p>
                <p className="font-heading text-[36px]/11 font-extrabold text-charcoal">{formatINR(featured.price)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:gap-[33px] xl:px-[41px]" aria-label="RMAX in numbers">
        {stats.map((s) => (
          <li key={s.label} className="rounded-[24px] border border-line/60 bg-card px-6 py-[18px] shadow-[0_2px_10px_rgb(35_42_50/0.03)]">
            <p className="font-heading text-[32px]/10 font-extrabold text-charcoal xl:text-[40px]/[48px]">{s.value}</p>
            <p className="text-body text-muted xl:text-[18px]/7">{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
