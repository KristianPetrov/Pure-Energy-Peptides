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
      preload={size > 60}
    />
  );
}

export function LogoWordmark() {
  return (
    <span className="flex items-baseline gap-1.5 font-bold tracking-wide">
      <span className="text-aqua">pure</span>
      <span className="text-flame">energy</span>
      <span className="font-script text-faint text-[1.25em] font-normal tracking-normal">
        Peptides
      </span>
    </span>
  );
}
