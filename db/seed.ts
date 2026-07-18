import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, notInArray, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  priceCents: number;
  image: string;
  inventory: number;
  featured?: boolean;
};

const catalog: SeedProduct[] = [
  {
    slug: "bpc-157-10mg",
    name: "BPC-157",
    shortDescription: "10mg - Body Protection Compound",
    description:
      "BPC-157 is a synthetic pentadecapeptide studied extensively in preclinical models for its role in tissue repair, angiogenesis, and gut-lining research. A staple reference compound for recovery and connective-tissue investigations.",
    category: "Repair & Recovery",
    priceCents: 10000,
    image: "/products/mockups/bpc-157-10mg.png",
    inventory: 2,
    featured: true,
  },
  {
    slug: "tb-500-10mg",
    name: "TB-500",
    shortDescription: "10mg - Thymosin Beta-4 Fragment",
    description:
      "TB-500 is the synthetic analog of the active region of Thymosin Beta-4, a peptide investigated in models of cellular migration, vascularization, and recovery research.",
    category: "Repair & Recovery",
    priceCents: 18000,
    image: "/products/mockups/tb-500-10mg.png",
    inventory: 2,
    featured: true,
  },
  {
    slug: "wolverine-pro-10mg",
    name: "Wolverine",
    shortDescription: "Advanced recovery blend",
    description:
      "Wolverine is a repair-oriented research blend formulated for controlled comparative studies of recovery and connective-tissue pathways.",
    category: "Repair & Recovery",
    priceCents: 30000,
    image: "/products/wolverine-pro-10mg.svg",
    inventory: 2,
    featured: true,
  },
  {
    slug: "klow-10mg-50mg",
    name: "KLOW",
    shortDescription: "Multi-compound research blend",
    description:
      "KLOW is a multi-compound research blend prepared for controlled comparative investigations of repair and regeneration pathways.",
    category: "Repair & Recovery",
    priceCents: 35000,
    image: "/products/klow-10mg-50mg.svg",
    inventory: 2,
  },
  {
    slug: "glow-blend",
    name: "GLOW",
    shortDescription: "Multi-compound research blend",
    description:
      "GLOW is a multi-compound research blend prepared for controlled comparative investigations of dermal and connective-tissue pathways.",
    category: "Repair & Recovery",
    priceCents: 32500,
    image: "/products/glow-blend.svg",
    inventory: 2,
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-Cu",
    shortDescription: "50mg - Copper Peptide",
    description:
      "GHK-Cu is a naturally occurring copper-binding tripeptide widely referenced in dermal regeneration, collagen remodeling, and anti-inflammatory research.",
    category: "Repair & Recovery",
    priceCents: 7500,
    image: "/products/mockups/ghk-cu-50mg.png",
    inventory: 1,
  },
  {
    slug: "ghk-cu-100mg",
    name: "GHK-Cu",
    shortDescription: "100mg - Copper Peptide",
    description:
      "A higher-concentration GHK-Cu reference vial for controlled dermal-regeneration and collagen-remodeling research.",
    category: "Repair & Recovery",
    priceCents: 10000,
    image: "/products/mockups/ghk-cu-100mg.png",
    inventory: 1,
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    shortDescription: "Antioxidant tripeptide",
    description:
      "Glutathione is an endogenous tripeptide used as a reference compound in oxidative-stress, redox, and cellular-protection research.",
    category: "Repair & Recovery",
    priceCents: 14000,
    image: "/products/mockups/glutathione-1000iu.png",
    inventory: 1,
  },
  {
    slug: "cjc-1295-10mg-ipamorelin-10mg",
    name: "CJC-1295 / Ipamorelin Blend",
    shortDescription: "10mg / 10mg - GH Secretagogue Stack",
    description:
      "A combination of CJC-1295 and Ipamorelin, two growth-hormone secretagogues frequently paired in endocrine and metabolic research models.",
    category: "Growth & Metabolic",
    priceCents: 15000,
    image: "/products/mockups/cjc-1295-ipa-10mg.png",
    inventory: 1,
    featured: true,
  },
  {
    slug: "ipamorelin-10mg",
    name: "Ipamorelin",
    shortDescription: "10mg - Selective GH Secretagogue",
    description:
      "Ipamorelin is a selective growth-hormone secretagogue and ghrelin-receptor agonist studied for its targeted release profile in endocrine research.",
    category: "Growth & Metabolic",
    priceCents: 10000,
    image: "/products/mockups/ipamorelin-10mg.png",
    inventory: 1,
  },
  {
    slug: "hcg",
    name: "HCG",
    shortDescription: "Human Chorionic Gonadotropin",
    description:
      "HCG is a glycoprotein hormone supplied as a reference compound for controlled endocrine and receptor-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 20000,
    image: "/products/mockups/hcg-1000iu.png",
    inventory: 2,
  },
  {
    slug: "hgh-150iu",
    name: "HGH 150",
    shortDescription: "150 IU - Human Growth Hormone",
    description:
      "HGH 150 is a somatotropin reference preparation for controlled growth-hormone and endocrine-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 12000,
    image: "/products/hgh-150iu.svg",
    inventory: 3,
  },
  {
    slug: "sermorelin",
    name: "Sermorelin",
    shortDescription: "GHRH analog",
    description:
      "Sermorelin is a growth-hormone-releasing hormone analog referenced in controlled endocrine and signaling-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 20000,
    image: "/products/mockups/sermorelin-10mg.png",
    inventory: 1,
  },
  {
    slug: "tesamorelin-10mg",
    name: "Tesamorelin",
    shortDescription: "10mg - GHRH Analog",
    description:
      "Tesamorelin is a stabilized growth-hormone-releasing hormone (GHRH) analog referenced in metabolic and adipose-tissue research.",
    category: "Growth & Metabolic",
    priceCents: 22500,
    image: "/products/mockups/tesamorelin-10mg.png",
    inventory: 1,
  },
  {
    slug: "tesamorelin-20mg",
    name: "Tesamorelin",
    shortDescription: "20mg - GHRH Analog (High Concentration)",
    description:
      "A higher-concentration vial of Tesamorelin, a stabilized GHRH analog used in metabolic and adipose-tissue research.",
    category: "Growth & Metabolic",
    priceCents: 40000,
    image: "/products/mockups/tesamorelin-20mg.png",
    inventory: 1,
  },
  {
    slug: "rt-3-10mg",
    name: "Retatrutide",
    shortDescription: "10mg - Triple-Agonist (Research)",
    description:
      "Retatrutide is a triple-agonist peptide (GIP/GLP-1/glucagon) under active investigation in metabolic and weight-regulation research.",
    category: "Growth & Metabolic",
    priceCents: 15000,
    image: "/products/mockups/retatrutide-10mg.png",
    inventory: 2,
    featured: true,
  },
  {
    slug: "rt-3-20mg",
    name: "Retatrutide",
    shortDescription: "20mg - Triple-Agonist (Research)",
    description:
      "A higher-concentration vial of Retatrutide, a triple-agonist peptide (GIP/GLP-1/glucagon) studied in metabolic research.",
    category: "Growth & Metabolic",
    priceCents: 30000,
    image: "/products/mockups/retatrutide-20mg.png",
    inventory: 1,
  },
  {
    slug: "rt-3-30mg",
    name: "Retatrutide",
    shortDescription: "30mg - Triple-Agonist (Research)",
    description:
      "The highest-concentration Retatrutide vial in the catalog, intended for extended metabolic research protocols.",
    category: "Growth & Metabolic",
    priceCents: 40000,
    image: "/products/mockups/retatrutide-30mg.png",
    inventory: 3,
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide",
    shortDescription: "10mg - Dual-Agonist (Research)",
    description:
      "Tirzepatide is a dual GIP/GLP-1 receptor agonist referenced in controlled metabolic and signaling-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 12000,
    image: "/products/mockups/tirzepatide-10mg.png",
    inventory: 1,
  },
  {
    slug: "tirzepatide-20mg",
    name: "Tirzepatide",
    shortDescription: "20mg - Dual-Agonist (Research)",
    description:
      "A higher-concentration Tirzepatide reference vial for controlled metabolic and receptor-signaling research.",
    category: "Growth & Metabolic",
    priceCents: 15000,
    image: "/products/mockups/tirzepatide-20mg.png",
    inventory: 1,
  },
  {
    slug: "tirzepatide-30mg",
    name: "Tirzepatide",
    shortDescription: "30mg - Dual-Agonist (Research)",
    description:
      "A high-concentration Tirzepatide reference vial for extended metabolic and receptor-signaling research protocols.",
    category: "Growth & Metabolic",
    priceCents: 18000,
    image: "/products/mockups/tirzepatide-30mg.png",
    inventory: 1,
  },
  {
    slug: "mots-c-10mg",
    name: "MOTS-c",
    shortDescription: "10mg - Mitochondrial-Derived Peptide",
    description:
      "MOTS-c is a mitochondrial-derived peptide studied for its role in metabolic regulation, insulin sensitivity, and cellular energy research.",
    category: "Longevity & Mitochondrial",
    priceCents: 10000,
    image: "/products/mockups/mots-c-10mg.png",
    inventory: 1,
  },
  {
    slug: "mots-c-40mg",
    name: "MOTS-c",
    shortDescription: "40mg - Mitochondrial-Derived Peptide",
    description:
      "A high-concentration MOTS-c vial for extended mitochondrial and metabolic research protocols.",
    category: "Longevity & Mitochondrial",
    priceCents: 30000,
    image: "/products/mockups/mots-c-40mg.png",
    inventory: 1,
  },
  {
    slug: "nad-500mg",
    name: "NAD+",
    shortDescription: "500mg - Cellular Coenzyme",
    description:
      "NAD+ is an essential coenzyme central to cellular metabolism, DNA repair, and longevity research at the mitochondrial level.",
    category: "Longevity & Mitochondrial",
    priceCents: 14000,
    image: "/products/mockups/nad-500mg.png",
    inventory: 1,
    featured: true,
  },
  {
    slug: "ss-31-10mg",
    name: "SS-31 (Elamipretide)",
    shortDescription: "10mg - Mitochondrial-Targeted Peptide",
    description:
      "SS-31 is a mitochondria-targeted tetrapeptide referenced in research on cardiolipin stabilization and cellular energy production.",
    category: "Longevity & Mitochondrial",
    priceCents: 15000,
    image: "/products/mockups/ss-31-10mg.png",
    inventory: 1,
  },
  {
    slug: "semax-10mg",
    name: "Semax",
    shortDescription: "10mg - Nootropic Peptide",
    description:
      "Semax is a synthetic peptide derived from ACTH(4-10), studied for its influence on BDNF expression and cognitive research models.",
    category: "Cognitive & Nootropic",
    priceCents: 13000,
    image: "/products/mockups/semax-10mg.png",
    inventory: 1,
  },
  {
    slug: "selank-10mg",
    name: "Selank",
    shortDescription: "10mg - Anxiolytic Peptide",
    description:
      "Selank is a synthetic analog of the immunomodulatory peptide tuftsin, referenced in anxiolytic and neuroregulatory research.",
    category: "Cognitive & Nootropic",
    priceCents: 13000,
    image: "/products/mockups/selank-10mg.png",
    inventory: 1,
  },
  {
    slug: "lipo-c-b12",
    name: "Lipo-C + B12",
    shortDescription: "Lipotropic research blend",
    description:
      "Lipo-C + B12 combines lipotropic reference compounds with vitamin B12 for controlled laboratory and analytical research.",
    category: "Specialty Research",
    priceCents: 13000,
    image: "/products/mockups/lipo-c-b12-10ml.png",
    inventory: 1,
  },
];

async function seedProducts(resetInventory: boolean) {
  for (const item of catalog) {
    await db
      .insert(schema.products)
      .values({
        slug: item.slug,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        category: item.category,
        priceCents: item.priceCents,
        image: item.image,
        inventory: item.inventory,
        featured: item.featured ?? false,
        active: true,
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        // Preserve live inventory and active state on reseed.
        set: {
          name: item.name,
          shortDescription: item.shortDescription,
          description: item.description,
          category: item.category,
          priceCents: item.priceCents,
          image: item.image,
          featured: item.featured ?? false,
          ...(resetInventory
            ? { inventory: item.inventory, active: true }
            : {}),
        },
      });
  }

  const catalogSlugs = catalog.map((item) => item.slug);
  await db
    .update(schema.products)
    .set({ active: false })
    .where(notInArray(schema.products.slug, catalogSlugs));

  console.log(
    `Seeded ${catalog.length} products${
      resetInventory ? " with shipment inventory" : ""
    } and retired older listings.`
  );
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set; skipping admin seed."
    );
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email));

  if (existing.length > 0) {
    await db
      .update(schema.users)
      .set({
        passwordHash,
        role: "admin",
        emailVerifiedAt: sql`now()`,
      })
      .where(eq(schema.users.email, email));
    console.log(`Updated admin account ${email}.`);
  } else {
    await db.insert(schema.users).values({
      name: "Admin",
      email,
      passwordHash,
      role: "admin",
      emailVerifiedAt: new Date(),
    });
    console.log(`Created admin account ${email}.`);
  }
}

async function main() {
  const resetInventory = process.argv.includes("--reset-inventory");
  const productsOnly = process.argv.includes("--products-only");
  await seedProducts(resetInventory);
  if (!productsOnly) await seedAdmin();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
