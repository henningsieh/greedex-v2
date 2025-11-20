import Image from "next/image";

type RightSideImageProps = {
  heroBadge: string;
  heroTitle: string;
  heroCaption: string;
  heroStatOne: string;
  heroStatTwo: string;
};

export default function RightSideImage({
  heroBadge,
  heroTitle,
  heroCaption,
  heroStatOne,
  heroStatTwo,
}: RightSideImageProps) {
  return (
    <div className="relative hidden lg:flex">
      <div className="relative flex-1">
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.8)] backdrop-blur lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_70%)]" />
          <div className="space-y-3">
            <div className="flex items-center gap-3 font-semibold text-emerald-200 text-xs uppercase tracking-[0.4em]">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span>{heroBadge}</span>
            </div>
            <h3 className="font-semibold text-3xl text-white">{heroTitle}</h3>
            <p className="text-sm text-white/80">{heroCaption}</p>
          </div>

          <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <Image
              src="/Greendex-hero-banner.png"
              alt="Greendex dashboards"
              fill
              sizes="(max-width: 1024px) 100vw, 540px"
              className="object-cover"
            />
          </div>

          <div className="grid gap-3 text-[0.65rem] text-white/80 uppercase tracking-[0.4em] sm:grid-cols-2">
            <span className="rounded-2xl border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-emerald-100">
              {heroStatOne}
            </span>
            <span className="rounded-2xl border border-white/20 bg-white/5 px-3 py-2">
              {heroStatTwo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
