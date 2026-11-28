
import type { IProduct } from "../src/models/Product";

export type Cat = IProduct["category"];
type Row = [label: string, value: string, unit?: string];

export interface CatalogueItem {
  slug: string;
  name: string;
  category: Cat;
  /** Managed ProductCategory slug. */
  group: "sanitary-hygiene-solutions" | "waste-management-sanitation" | "iot-smart-technology";
  summary: string;
  overview: string;
  features?: [title: string, body: string][];
  applications?: [title: string, body: string][];
  specs?: Row[];
  chips: string[];
  /** Fields of IProduct.specs that are documented; the rest stay "Not specified". */
  docSpecs?: Partial<Record<"dailyCapacity" | "batchCapacity" | "power" | "chamber" | "warranty" | "weight", string>>;
  warranty?: { duration: string; type: string; description: string };
  /** Existing seeded product: only content/ordering fields are touched, its ImageKit photos are kept. */
  existing?: boolean;
  /** Created unpublished (no verified photo yet). Only set on insert, so publishing in admin is never reverted by a re-run. */
  draft?: boolean;
}

export const GROUPS = {
  "sanitary-hygiene-solutions": { name: "Sanitary Hygiene Solutions", sortOrder: 1 },
  "waste-management-sanitation": { name: "Waste Management & Sanitation", sortOrder: 2 },
  "iot-smart-technology": { name: "IoT & Smart Technology", sortOrder: 3 },
} as const;

const H = "sanitary-hygiene-solutions" as const;
const W = "waste-management-sanitation" as const;
const I = "iot-smart-technology" as const;

const HYGIENE_PLACES = "Schools, colleges, hospitals, offices and public toilets";

export const CATALOGUE: CatalogueItem[] = [
  /* ---------------- 1. Sanitary hygiene ---------------- */
  {
    slug: "automatic-sanitary-napkin-vending-machine", name: "Automatic Sanitary Pad Vending Machine – Basic", category: "automatic-vending", group: H,
    summary: "An automatic sanitary pad vending machine with a 50-pad capacity.",
    overview: "This 12 kg automatic vending machine is designed to make sanitary pads available in shared washrooms. It dispenses automatically and carries clear user instructions on the front. Suggested applications include colleges, offices and other facilities that need a dedicated dispensing point.",
    features: [["Automatic dispensing", "Dispenses napkins automatically."], ["50-pad capacity", "Holds 50 pads."], ["12 kg weight", "Weighs 12 kg."], ["Clear user instructions", "Usage instructions displayed on the unit."]],
    applications: [[HYGIENE_PLACES, "Menstrual hygiene access for institutions and public washrooms."]],
    // Supplied measurements 33.5 / 50 / 15.5 cm are not published: the L × W × H mapping is unconfirmed.
    specs: [["Capacity", "50 pads", "pads"], ["Operation", "Automatic dispensing"], ["Weight", "12 kg"], ["Instructions", "Displayed on the front of the unit"]],
    chips: ["50 pads", "Automatic", "12 kg"], docSpecs: { dailyCapacity: "50 pads", weight: "12 kg" },
  },
  {
    slug: "sanitary-pad-vending-machine-25-pad", name: "Manual Sanitary Pad Vending Machine – Basic", category: "manual-vending", group: H,
    summary: "A compact manual sanitary pad vending machine with a 25-pad capacity.",
    overview: "This manual vending machine provides access to sanitary pads in shared washrooms. It measures 30 × 12 × 48 cm (L × W × H) and weighs 8–10 kg. Suggested applications include schools, colleges and workplaces.",
    features: [["Manual operation", "Manually operated dispensing."], ["25-pad capacity", "Holds 25 pads."], ["Compact dimensions", "30 × 12 × 48 cm (L × W × H)."]],
    applications: [["Schools & colleges", "Pad access for campus washrooms."], ["Workplaces", "A dedicated dispensing point for office washrooms."]],
    specs: [["Capacity", "25 pads"], ["Operation", "Manual"], ["Dimensions (L × W × H)", "30 × 12 × 48 cm"], ["Weight", "8–10 kg"]],
    chips: ["25 pads", "Manual", "8–10 kg"], docSpecs: { dailyCapacity: "25 pads", weight: "8–10 kg" },
  },
  {
    slug: "sanitary-pad-disposal-machine-100-pad", name: "Automatic Sanitary Pad Disposal Machine – Basic", category: "incinerator", group: H, existing: true,
    summary: "A compact, wall-mounted automatic incinerator with an 800 W heater and a disposal capacity of 25–100 sanitary pads per batch.",
    overview: "The Small model offers a compact, wall-mounted option for sanitary pad disposal in shared washrooms. It measures 25 × 25 × 43 cm, weighs 10–12 kg, and includes a one-year warranty.",
    features: [
      ["Automatic operation", "Enclosed automatic high-temperature incineration system."],
      ["800 W heater", "Rapid and hygienic thermal disposal for compact facilities."],
      ["Wall-mounted design", "Space-saving wall-mounted installation for washrooms."],
    ],
    applications: [
      ["Schools & institutes", "Safe and private menstrual hygiene disposal for educational campuses."],
      ["Offices & workspaces", "Discreet wall-mounted disposal for corporate and clinic restrooms."],
      ["Hostels & guest facilities", "Compact, hygienic sanitary waste management for shared washrooms."],
      ["Hospitals & clinics", "Clean thermal destruction of sanitary pads in local medical rooms."],
    ],
    specs: [
      ["Dimensions (L × B × H)", "25 × 25 × 43 cm", "cm"],
      ["Weight", "10–12 kg", "kg"],
      ["Disposal capacity", "25–100 sanitary pads per batch", "pads/batch"],
      ["Heater rating", "800 W", "W"],
      ["Operation", "Automatic"],
      ["Mounting", "Wall-mounted"],
      ["Warranty", "1 year"],
    ],
    chips: ["25–100 pads/batch", "800 W heater", "Wall-mounted", "1-year warranty"],
    docSpecs: { dailyCapacity: "25–100 pads/batch", batchCapacity: "25–100 pads", power: "800 W", weight: "10–12 kg", warranty: "1 year" },
    warranty: { duration: "1 year", type: "Manufacturer warranty", description: "One-year warranty duration as specified." },
  },
  {
    slug: "sanitary-pad-disposal-machine", name: "Automatic Sanitary Pad Disposal Machine – Pro", category: "incinerator", group: H, existing: true,
    summary: "A wall-mounted automatic incinerator with a disposal capacity of 250 sanitary pads per batch.",
    overview: "The Medium model is an option for schools, colleges, offices, and other facilities with shared washrooms. It measures 25 × 25 × 46 cm, weighs 12–15 kg, and includes a one-year warranty.",
    features: [
      ["Automatic operation", "Enclosed automatic high-temperature incineration system."],
      ["250 pads capacity", "Designed for regular batch disposal in institutional washrooms."],
      ["Wall-mounted design", "Space-saving wall-mounted installation for washrooms."],
    ],
    applications: [
      ["Schools & colleges", "Menstrual waste disposal for medium-footfall educational institutions."],
      ["Offices & workplaces", "Hygienic and discreet disposal for corporate washrooms."],
      ["Hospitals & nursing homes", "Safe, touchless disposal meeting institutional hygiene standards."],
      ["Public & commercial facilities", "Reliable waste reduction for shopping complexes and transit centers."],
    ],
    specs: [
      ["Dimensions (L × B × H)", "25 × 25 × 46 cm", "cm"],
      ["Weight", "12–15 kg", "kg"],
      ["Disposal capacity", "250 sanitary pads per batch", "pads/batch"],
      ["Operation", "Automatic"],
      ["Mounting", "Wall-mounted"],
      ["Warranty", "1 year"],
    ],
    chips: ["250 pads/batch", "Wall-mounted", "Automatic", "1-year warranty"],
    docSpecs: { dailyCapacity: "250 pads/batch", batchCapacity: "250 pads", weight: "12–15 kg", warranty: "1 year" },
    warranty: { duration: "1 year", type: "Manufacturer warranty", description: "One-year warranty duration as specified." },
  },
  {
    slug: "sanitary-pad-disposal-machine-500-pad", name: "Automatic Sanitary Pad Disposal Machine – Pro Max", category: "incinerator", group: H, existing: true,
    summary: "A wall-mounted automatic incinerator with a 1,200 W heater and a disposal capacity of 500 sanitary pads per batch.",
    overview: "The Large model is designed for facilities with higher disposal needs, such as campuses, workplaces, and public facilities. It measures 30 × 30 × 60 cm, weighs 18–20 kg, and includes a one-year warranty.",
    features: [
      ["Automatic operation", "High-capacity automatic incineration system."],
      ["1,200 W heater", "High-performance heater for efficient, rapid thermal disposal."],
      ["Wall-mounted design", "Engineered for heavy-duty institutional washroom wall mounting."],
    ],
    applications: [
      ["Campuses & universities", "High-capacity menstrual waste processing for residential campuses."],
      ["Corporate complexes", "Heavy-duty sanitary disposal for multi-floor commercial complexes."],
      ["Hospitals & medical centers", "High-temperature thermal destruction for high-footfall institutions."],
      ["Transit hubs & public facilities", "Continuous-capacity sanitary pad management for airports, railways, and municipal facilities."],
    ],
    specs: [
      ["Dimensions (L × B × H)", "30 × 30 × 60 cm", "cm"],
      ["Weight", "18–20 kg", "kg"],
      ["Disposal capacity", "500 sanitary pads per batch", "pads/batch"],
      ["Heater rating", "1,200 W", "W"],
      ["Operation", "Automatic"],
      ["Mounting", "Wall-mounted"],
      ["Warranty", "1 year"],
    ],
    chips: ["500 pads/batch", "1,200 W heater", "Wall-mounted", "1-year warranty"],
    docSpecs: { dailyCapacity: "500 pads/batch", batchCapacity: "500 pads", power: "1,200 W", weight: "18–20 kg", warranty: "1 year" },
    warranty: { duration: "1 year", type: "Manufacturer warranty", description: "One-year warranty duration as specified." },
  },

  /* ---------------- 2. Waste management & sanitation ---------------- */

  /* ---------------- 3. IoT & smart technology ---------------- */
  {
    slug: "gps-trackers", name: "GPS Trackers", category: "iot-smart-tech", group: I,
    summary: "Reliable location tracking for vehicles, assets and fleet management.",
    overview: "GPS trackers for reliable location tracking of vehicles and assets, and for fleet management applications.",
    features: [["Location tracking", "Tracks vehicles and assets."]],
    applications: [["Vehicles", "Location tracking."], ["Assets", "Location tracking."], ["Fleet management", "Fleet visibility."]],
    chips: ["Vehicles", "Assets", "Fleet"],
  },
];
