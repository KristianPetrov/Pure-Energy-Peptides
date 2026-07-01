import Image from "next/image";
import logoMark from "@/public/brand/pep-mark.png";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Image
      src={logoMark}
      alt=""
      aria-hidden="true"
      sizes={`${Math.ceil(size * 1.5)}px`}
      style={{ width: size, height: "auto" }}
      priority={size > 60}
    />
  );
}

export function LogoWordmark() {
  return (
    <span className="flex items-baseline gap-1.5 font-bold tracking-wide">
      <span className="text-aqua">PURE</span>
      <span className="text-flame">ENERGY</span>
      <span className="text-faint text-[0.72em] font-semibold tracking-[0.28em]">
        PEPTIDES
      </span>
    </span>
  );
}
