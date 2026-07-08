import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_NAME, SITE_DOMAIN, SITE_TAGLINE } from "@/lib/constants";

export const alt = `${BRAND_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logo = readFileSync(
    join(process.cwd(), "public/brand/pe-clear.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a101c",
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(0,199,199,0.28), transparent 48%), radial-gradient(circle at 84% 88%, rgba(255,122,0,0.26), transparent 48%)",
        }}
      >
        <img src={logoSrc} width={640} height={381} alt="" />
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 1,
          }}
        >
          {`${SITE_TAGLINE} · 99% Purity · HPLC Tested`}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 26,
            color: "#00c7c7",
            letterSpacing: 4,
          }}
        >
          {SITE_DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
