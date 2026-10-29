import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { capacityRange } from "@/lib/home";
import { formatINR } from "@/lib/format";
import type { HomeStat, ProductDTO } from "@/lib/data/content";

/** Headline + hero card, then the four-number strip. */
export function HomeHero({ featured, stats }: { featured?: ProductDTO; stats: HomeStat[] }) {
  return (
    <section className="mx-auto w-full max-w-(--container-page) px-5 pt-4 sm:px-8 md:pt-8 lg:px-8 xl:px-16 xl:pt-[66px]">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_534px] xl:gap-8">
        <div>
          <h1 className="max-w-[640px] font-heading text-[32px]/[40px] sm:text-[46px]/[54px] lg:text-[42px]/[50px] xl:text-[64px]/[72px] 2xl:text-[72px]/[84px] font-extrabold tracking-[-1.5px] text-charcoal">
            Smart hygiene. Built for your institutions.
          </h1>
          <p className="mt-4 max-w-[590px] text-body text-muted md:mt-5 lg:text-[17px]/7 xl:text-[20px]/8 xl:mt-[38px]">
            RMAX Solutions is an Indian manufacturer and OEM supplier of sanitary waste disposal, pad vending systems and smart service
            hardware.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-[13px]">
            <ButtonLink href="#best-sellers" className="h-[50px] px-6 text-[14px] sm:h-[54px] sm:px-7 lg:h-[52px] lg:px-6 xl:h-[58px] xl:px-8 xl:text-[15px] w-full sm:w-auto text-center">
              Shop best sellers
            </ButtonLink>
            <ButtonLink href="/compare-models" variant="outline" className="h-[50px] px-6 text-[14px] sm:h-[54px] sm:px-7 lg:h-[52px] lg:px-6 xl:h-[58px] xl:px-8 xl:text-[15px]">
              View All Products
            </ButtonLink>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] lg:rounded-[32px] xl:rounded-[36px] border border-line/60 bg-card shadow-[0_12px_40px_rgb(0_41_112/0.08)] lg:mt-2 xl:mt-[15px]">
          <Image
            src="/images/home/hero.png"
            alt="RMAX Pro-Max incinerator mounted on a washroom wall"
            width={534}
            height={300}
            priority
            style={{ width: "100%", height: "auto" }}
            className="w-full object-cover"
          />
          {featured && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3.5 sm:p-4 lg:gap-x-5 xl:gap-x-8 xl:pt-[15px]">
              <div className="min-w-[170px] lg:min-w-[180px] xl:min-w-[242px] rounded-[16px] xl:rounded-[20px] bg-charcoal px-4 py-3 sm:px-5 sm:py-4 text-white">
                <p className="text-body-sm text-muted-dark">Burning capacity</p>
                <p className="font-heading text-[26px]/8 lg:text-[28px]/9 xl:text-[36px]/11 font-extrabold">{capacityRange(featured.specs.dailyCapacity)}</p>
              </div>
              <div>
                <p className="text-body-sm text-muted">{featured.name} incinerator</p>
                <p className="font-heading text-[26px]/8 lg:text-[28px]/9 xl:text-[36px]/11 font-extrabold text-charcoal">{formatINR(featured.price)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-4 xl:gap-[33px] xl:px-[41px]" aria-label="RMAX in numbers">
        {stats.map((s) => (
          <li key={s.label} className="rounded-[20px] lg:rounded-[24px] border border-line/60 bg-card px-4 py-3 sm:px-6 sm:py-[18px] shadow-[0_2px_10px_rgb(35_42_50/0.03)]">
            <p className="font-heading text-[28px]/9 sm:text-[32px]/10 font-extrabold text-charcoal xl:text-[40px]/[48px]">{s.value}</p>
            <p className="text-body text-muted text-[13px] sm:text-[14px] xl:text-[18px]/7">{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
