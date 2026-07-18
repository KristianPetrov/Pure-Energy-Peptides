import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { MockupCompare } from "@/components/mockup-compare";

export const metadata: Metadata = {
  title: "Mockup comparison",
  robots: { index: false, follow: false },
};

export default async function MockupComparePage() {
  "use cache";
  const dir = path.join(process.cwd(), "public/products/mockups-ai");
  const names = (await readdir(dir))
    .filter((file) => file.endsWith(".png"))
    .map((file) => file.replace(/\.png$/, ""))
    .sort();

  return <MockupCompare names={names} />;
}
