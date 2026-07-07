import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/data";
import { BRAND_NAME, SITE_DOMAIN } from "@/lib/constants";

export const alt = `${BRAND_NAME} product`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function productImageSrc(imagePath: string) {
  try {
    if (!imagePath.startsWith("/")) return null;
    const file = readFileSync(join(process.cwd(), "public", imagePath));
    const mime = imagePath.endsWith(".svg") ? "image/svg+xml" : "image/png";
    return `data:${mime};base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  const imageSrc = product ? productImageSrc(product.image) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: 72,
          backgroundColor: "#0a101c",
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(0,199,199,0.25), transparent 48%), radial-gradient(circle at 88% 90%, rgba(255,122,0,0.24), transparent 48%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            paddingRight: 48,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 2 }}>
            <span style={{ color: "#00c7c7" }}>pure</span>
            <span style={{ color: "#ff7a00", marginLeft: 10 }}>energy</span>
            <span style={{ color: "rgba(255,255,255,0.8)", marginLeft: 10 }}>
              peptides
            </span>
          </div>
          {product?.category && (
            <div
              style={{
                marginTop: 44,
                fontSize: 24,
                color: "#00c7c7",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {product.category}
            </div>
          )}
          <div
            style={{
              marginTop: 14,
              fontSize: 68,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {product?.name ?? "Research Peptides"}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 27,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            99% Purity · HPLC Tested · Research Use Only
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              color: "#00c7c7",
              letterSpacing: 4,
            }}
          >
            {SITE_DOMAIN}
          </div>
        </div>
        {imageSrc && <img src={imageSrc} width={330} height={374} alt="" />}
      </div>
    ),
    { ...size }
  );
}
