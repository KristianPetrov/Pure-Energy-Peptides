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
  /** Storefront visibility. Missing / not-yet-stocked SKUs stay inactive. */
  active?: boolean;
};

const catalog: SeedProduct[] = [
  // ── Repair & Recovery (active) ──────────────────────────────────────────
  {
    slug: "bpc-157-10mg",
    name: "BPC-157",
    shortDescription: "10mg - Body Protection Compound",
    description:
      "BPC-157 is a synthetic pentadecapeptide studied extensively in preclinical models for its role in tissue repair, angiogenesis, and gut-lining research. A staple reference compound for recovery and connective-tissue investigations.",
    category: "Repair & Recovery",
    priceCents: 8900,
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
    priceCents: 8900,
    image: "/products/mockups/tb-500-10mg.png",
    inventory: 2,
    featured: true,
  },
  {
    slug: "klow-80mg",
    name: "KLOW",
    shortDescription: "80mg - GHK+KPV+BPC+TB blend",
    description:
      "KLOW is a multi-compound research blend (GHK-Cu, KPV, BPC-157, and TB-500) prepared for controlled comparative investigations of repair and regeneration pathways.",
    category: "Repair & Recovery",
    priceCents: 15900,
    image: "/products/mockups/klow-80mg.png",
    inventory: 2,
  },
  {
    slug: "glow-70mg",
    name: "GLOW",
    shortDescription: "70mg - BPC+TB+GHK blend",
    description:
      "GLOW is a multi-compound research blend (BPC-157, TB-500, and GHK-Cu) prepared for controlled comparative investigations of dermal and connective-tissue pathways.",
    category: "Repair & Recovery",
    priceCents: 13900,
    image: "/products/mockups/glow-70mg.png",
    inventory: 2,
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-Cu",
    shortDescription: "50mg - Copper Peptide",
    description:
      "GHK-Cu is a naturally occurring copper-binding tripeptide widely referenced in dermal regeneration, collagen remodeling, and anti-inflammatory research.",
    category: "Repair & Recovery",
    priceCents: 6900,
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
    priceCents: 10900,
    image: "/products/mockups/ghk-cu-100mg.png",
    inventory: 1,
  },
  {
    slug: "glutathione-1500iu",
    name: "Glutathione",
    shortDescription: "1500mg - Antioxidant tripeptide",
    description:
      "Glutathione is an endogenous tripeptide used as a reference compound in oxidative-stress, redox, and cellular-protection research.",
    category: "Repair & Recovery",
    priceCents: 7900,
    image: "/products/mockups/glutathione-1500iu.png",
    inventory: 1,
  },

  // ── Growth & Metabolic (active) ─────────────────────────────────────────
  {
    slug: "cjc-1295-10mg-ipamorelin-10mg",
    name: "CJC-1295 + IPA",
    shortDescription: "10mg - GH Secretagogue Stack (no DAC)",
    description:
      "A combination of CJC-1295 (no DAC) and Ipamorelin, two growth-hormone secretagogues frequently paired in endocrine and metabolic research models.",
    category: "Growth & Metabolic",
    priceCents: 11900,
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
    priceCents: 8900,
    image: "/products/mockups/ipamorelin-10mg.png",
    inventory: 1,
  },
  {
    slug: "hcg",
    name: "HCG",
    shortDescription: "10000 IU - Human Chorionic Gonadotropin",
    description:
      "HCG is a glycoprotein hormone supplied as a reference compound for controlled endocrine and receptor-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 8900,
    image: "/products/mockups/hcg-1000iu.png",
    inventory: 2,
  },
  {
    slug: "hgh-100iu",
    name: "HGH",
    shortDescription: "100 IU - Human Growth Hormone",
    description:
      "HGH is a somatotropin reference preparation for controlled growth-hormone and endocrine-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 19900,
    image: "/products/mockups/hgh-100iu.png",
    inventory: 1,
  },
  {
    slug: "hgh-150iu",
    name: "HGH",
    shortDescription: "150 IU - Human Growth Hormone",
    description:
      "HGH is a somatotropin reference preparation for controlled growth-hormone and endocrine-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 27900,
    image: "/products/mockups/hgh-150mg.png",
    inventory: 3,
  },
  {
    slug: "hgh-360iu",
    name: "HGH",
    shortDescription: "360 IU - Human Growth Hormone",
    description:
      "A high-concentration HGH reference preparation for controlled growth-hormone and endocrine-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 44900,
    image: "/products/mockups/hgh-360iu.png",
    inventory: 1,
  },
  {
    slug: "sermorelin",
    name: "Sermorelin",
    shortDescription: "10mg - GHRH analog",
    description:
      "Sermorelin is a growth-hormone-releasing hormone analog referenced in controlled endocrine and signaling-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 9900,
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
    priceCents: 9900,
    image: "/products/mockups/tesamorelin-10mg.png",
    inventory: 1,
  },
  {
    slug: "tesamorelin-20mg",
    name: "Tesamorelin",
    shortDescription: "20mg - GHRH Analog",
    description:
      "A higher-concentration vial of Tesamorelin, a stabilized GHRH analog used in metabolic and adipose-tissue research.",
    category: "Growth & Metabolic",
    priceCents: 16900,
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
    priceCents: 14900,
    image: "/products/mockups/retatrutide-10mg.png",
    inventory: 20,
    featured: true,
  },
  {
    slug: "rt-3-20mg",
    name: "Retatrutide",
    shortDescription: "20mg - Triple-Agonist (Research)",
    description:
      "A higher-concentration vial of Retatrutide, a triple-agonist peptide (GIP/GLP-1/glucagon) studied in metabolic research.",
    category: "Growth & Metabolic",
    priceCents: 22900,
    image: "/products/mockups/retatrutide-20mg.png",
    inventory: 10,
  },
  {
    slug: "rt-3-30mg",
    name: "Retatrutide",
    shortDescription: "30mg - Triple-Agonist (Research)",
    description:
      "The highest-concentration Retatrutide vial in the catalog, intended for extended metabolic research protocols.",
    category: "Growth & Metabolic",
    priceCents: 27900,
    image: "/products/mockups/retatrutide-30mg.png",
    inventory: 30,
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide",
    shortDescription: "10mg - Dual-Agonist (Research)",
    description:
      "Tirzepatide is a dual GIP/GLP-1 receptor agonist referenced in controlled metabolic and signaling-pathway research.",
    category: "Growth & Metabolic",
    priceCents: 13900,
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
    priceCents: 19900,
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
    priceCents: 25900,
    image: "/products/mockups/tirzepatide-30mg.png",
    inventory: 1,
  },

  // ── Longevity & Mitochondrial (active) ──────────────────────────────────
  {
    slug: "mots-c-10mg",
    name: "MOTS-c",
    shortDescription: "10mg - Mitochondrial-Derived Peptide",
    description:
      "MOTS-c is a mitochondrial-derived peptide studied for its role in metabolic regulation, insulin sensitivity, and cellular energy research.",
    category: "Longevity & Mitochondrial",
    priceCents: 7900,
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
    priceCents: 19900,
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
    priceCents: 9900,
    image: "/products/mockups/nad-500mg.png",
    inventory: 1,
    featured: true,
  },
  {
    slug: "ss-31-10mg",
    name: "SS-31",
    shortDescription: "10mg - Mitochondrial-Targeted Peptide",
    description:
      "SS-31 (Elamipretide) is a mitochondria-targeted tetrapeptide referenced in research on cardiolipin stabilization and cellular energy production.",
    category: "Longevity & Mitochondrial",
    priceCents: 19900,
    image: "/products/mockups/ss-31-10mg.png",
    inventory: 1,
  },

  // ── Cognitive & Nootropic (active) ──────────────────────────────────────
  {
    slug: "semax-10mg",
    name: "Semax",
    shortDescription: "10mg - Nootropic Peptide",
    description:
      "Semax is a synthetic peptide derived from ACTH(4-10), studied for its influence on BDNF expression and cognitive research models.",
    category: "Cognitive & Nootropic",
    priceCents: 7900,
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
    priceCents: 7900,
    image: "/products/mockups/selank-10mg.png",
    inventory: 1,
  },

  // ── Specialty Research (active) ─────────────────────────────────────────
  {
    slug: "lipo-c-b12",
    name: "Lipo-C + B12",
    shortDescription: "10ml - Lipotropic research blend",
    description:
      "Lipo-C + B12 combines lipotropic reference compounds with vitamin B12 for controlled laboratory and analytical research.",
    category: "Specialty Research",
    priceCents: 8900,
    image: "/products/mockups/lipo-c-b12-10ml.png",
    inventory: 1,
  },

  // ── Inactive / coming soon (in price list, not yet stocked) ─────────────
  {
    slug: "5-amino-1mq-10mg",
    name: "5-Amino-1MQ",
    shortDescription: "10mg - NNMT inhibitor research compound",
    description:
      "5-Amino-1MQ is a small-molecule NNMT inhibitor referenced in metabolic and adipose-tissue research models.",
    category: "Growth & Metabolic",
    priceCents: 9900,
    image: "/products/mockups/mots-c-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "5-amino-1mq-50mg",
    name: "5-Amino-1MQ",
    shortDescription: "50mg - NNMT inhibitor research compound",
    description:
      "A higher-concentration 5-Amino-1MQ reference vial for extended metabolic and adipose-tissue research protocols.",
    category: "Growth & Metabolic",
    priceCents: 19900,
    image: "/products/mockups/mots-c-40mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "aod-9604-5mg",
    name: "AOD 9604",
    shortDescription: "5mg - HGH fragment analog",
    description:
      "AOD 9604 is a modified fragment of the C-terminus of human growth hormone referenced in lipid-metabolism research.",
    category: "Growth & Metabolic",
    priceCents: 7900,
    image: "/products/aod-9604-10mg.svg",
    inventory: 0,
    active: false,
  },
  {
    slug: "aod-9604-10mg",
    name: "AOD 9604",
    shortDescription: "10mg - HGH fragment analog",
    description:
      "A higher-concentration AOD 9604 reference vial for lipid-metabolism and adipose-tissue research.",
    category: "Growth & Metabolic",
    priceCents: 12900,
    image: "/products/aod-9604-10mg.svg",
    inventory: 0,
    active: false,
  },
  {
    slug: "bacteriostatic-water-3ml",
    name: "Bacteriostatic Water",
    shortDescription: "3ml - Sterile diluent",
    description:
      "Bacteriostatic water for injection, supplied as a sterile diluent for reconstituting lyophilized research materials in the laboratory.",
    category: "Specialty Research",
    priceCents: 1200,
    image: "/products/mockups/lipo-c-10ml.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "bacteriostatic-water-10ml",
    name: "Bacteriostatic Water",
    shortDescription: "10ml - Sterile diluent",
    description:
      "Bacteriostatic water for injection, supplied as a sterile diluent for reconstituting lyophilized research materials in the laboratory.",
    category: "Specialty Research",
    priceCents: 1800,
    image: "/products/mockups/lipo-c-10ml.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "bpc-tb-combo-20mg",
    name: "BPC + TB Combo",
    shortDescription: "20mg total (10mg each) - Repair stack",
    description:
      "A dual-vial research combo pairing BPC-157 and TB-500 for comparative repair and regeneration pathway investigations.",
    category: "Repair & Recovery",
    priceCents: 14900,
    image: "/products/bpc-157-10mg-ghk-cu-10mg-tb-500-10mg.svg",
    inventory: 0,
    active: false,
  },
  {
    slug: "cjc-1295-10mg",
    name: "CJC-1295",
    shortDescription: "10mg - GHRH analog (no DAC)",
    description:
      "CJC-1295 without DAC is a growth-hormone-releasing hormone analog referenced in controlled endocrine research.",
    category: "Growth & Metabolic",
    priceCents: 10900,
    image: "/products/mockups/cjc-1295-ipa-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "cjc-1295-dac-5mg",
    name: "CJC-1295 + DAC",
    shortDescription: "5mg - GHRH analog with DAC",
    description:
      "CJC-1295 with Drug Affinity Complex (DAC) is a long-acting GHRH analog referenced in endocrine and metabolic research.",
    category: "Growth & Metabolic",
    priceCents: 8900,
    image: "/products/mockups/cjc-1295-ipa-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "epithalon-50mg",
    name: "Epithalon",
    shortDescription: "50mg - Telomerase-related peptide",
    description:
      "Epithalon (Epitalon) is a synthetic tetrapeptide referenced in longevity, telomerase, and pineal-pathway research models.",
    category: "Longevity & Mitochondrial",
    priceCents: 12900,
    image: "/products/mockups/nad-500mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "ghrp-2-10mg",
    name: "GHRP-2",
    shortDescription: "10mg - Growth hormone secretagogue",
    description:
      "GHRP-2 is a synthetic growth-hormone-releasing peptide studied for its ghrelin-receptor agonist activity in endocrine research.",
    category: "Growth & Metabolic",
    priceCents: 5900,
    image: "/products/mockups/ipamorelin-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "igf-1-lr3-1mg",
    name: "IGF-1 LR3",
    shortDescription: "1mg - Long-acting IGF-1 analog",
    description:
      "IGF-1 LR3 is a long-acting insulin-like growth factor-1 analog referenced in cellular growth and metabolic research.",
    category: "Growth & Metabolic",
    priceCents: 11900,
    image: "/products/mockups/hgh-100iu.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "kpv-10mg",
    name: "KPV",
    shortDescription: "10mg - Anti-inflammatory tripeptide",
    description:
      "KPV is an alpha-MSH-derived tripeptide referenced in anti-inflammatory and gut-barrier research models.",
    category: "Repair & Recovery",
    priceCents: 9900,
    image: "/products/mockups/klow-80mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "l-carnitine-10ml",
    name: "L-Carnitine",
    shortDescription: "10ml (600mg/ml) - Metabolic research compound",
    description:
      "L-Carnitine solution supplied as a reference material for fatty-acid transport and metabolic research.",
    category: "Specialty Research",
    priceCents: 8900,
    image: "/products/mockups/lipo-c-10ml.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "lipo-c-10ml",
    name: "Lipo-C",
    shortDescription: "10ml - Lipotropic research blend",
    description:
      "Lipo-C is a lipotropic research blend prepared for controlled laboratory and analytical investigations.",
    category: "Specialty Research",
    priceCents: 7900,
    image: "/products/mockups/lipo-c-10ml.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "mt-2-10mg",
    name: "Melanotan II",
    shortDescription: "10mg - Melanocortin receptor agonist",
    description:
      "Melanotan II is a synthetic melanocortin receptor agonist referenced in pigmentation and receptor-pathway research.",
    category: "Specialty Research",
    priceCents: 5900,
    image: "/products/mt-2-10mg.svg",
    inventory: 0,
    active: false,
  },
  {
    slug: "nad-1000mg",
    name: "NAD+",
    shortDescription: "1000mg - Cellular Coenzyme",
    description:
      "A higher-concentration NAD+ reference vial for extended cellular-metabolism and longevity research protocols.",
    category: "Longevity & Mitochondrial",
    priceCents: 15900,
    image: "/products/nad-1000mg.svg",
    inventory: 0,
    active: false,
  },
  {
    slug: "ss-31-50mg",
    name: "SS-31",
    shortDescription: "50mg - Mitochondrial-Targeted Peptide",
    description:
      "A high-concentration SS-31 (Elamipretide) reference vial for extended mitochondrial and cardiolipin research protocols.",
    category: "Longevity & Mitochondrial",
    priceCents: 54900,
    image: "/products/mockups/ss-31-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "tirzepatide-15mg",
    name: "Tirzepatide",
    shortDescription: "15mg - Dual-Agonist (Research)",
    description:
      "A mid-range Tirzepatide reference vial for controlled metabolic and receptor-signaling research.",
    category: "Growth & Metabolic",
    priceCents: 16900,
    image: "/products/mockups/tirzepatide-10mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "tirzepatide-40mg",
    name: "Tirzepatide",
    shortDescription: "40mg - Dual-Agonist (Research)",
    description:
      "A high-concentration Tirzepatide reference vial for extended metabolic research protocols.",
    category: "Growth & Metabolic",
    priceCents: 32900,
    image: "/products/mockups/tirzepatide-30mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "tirzepatide-60mg",
    name: "Tirzepatide",
    shortDescription: "60mg - Dual-Agonist (Research)",
    description:
      "The highest-concentration Tirzepatide vial in the catalog for extended metabolic research protocols.",
    category: "Growth & Metabolic",
    priceCents: 39900,
    image: "/products/mockups/tirzepatide-30mg.png",
    inventory: 0,
    active: false,
  },
  {
    slug: "vitamin-b12-10ml",
    name: "Vitamin B12",
    shortDescription: "10ml (1mg/mL) - Cyanocobalamin reference",
    description:
      "Vitamin B12 (cyanocobalamin) solution supplied as a reference material for laboratory and analytical research.",
    category: "Specialty Research",
    priceCents: 8900,
    image: "/products/mockups/lipo-c-b12-10ml.png",
    inventory: 0,
    active: false,
  },
];

async function seedProducts(resetInventory: boolean) {
  let activeCount = 0;
  let inactiveCount = 0;

  for (const item of catalog) {
    const active = item.active ?? true;
    if (active) activeCount += 1;
    else inactiveCount += 1;

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
        active,
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: {
          name: item.name,
          shortDescription: item.shortDescription,
          description: item.description,
          category: item.category,
          priceCents: item.priceCents,
          image: item.image,
          featured: item.featured ?? false,
          active,
          ...(resetInventory ? { inventory: item.inventory } : {}),
        },
      });
  }

  // Retire anything no longer in the catalog (e.g. glutathione 1000IU).
  await db
    .update(schema.products)
    .set({ active: false })
    .where(
      notInArray(
        schema.products.slug,
        catalog.map((item) => item.slug)
      )
    );

  console.log(
    `Seeded ${catalog.length} products (${activeCount} active, ${inactiveCount} inactive)${
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
