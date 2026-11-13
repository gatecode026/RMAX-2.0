/**
 * Source of truth for the catalogue import (scripts/import-products.ts).
 * Facts come only from the RMAX company profile and the machinery specification catalogue.
 * Missing facts are deliberately omitted — no prices, models, certifications or invented figures.
 */
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
  docSpecs?: Partial<Record<"dailyCapacity" | "batchCapacity" | "power" | "chamber" | "warranty", string>>;
  warranty?: { duration: string; type: string; description: string };
  /** Existing seeded product: only content/ordering fields are touched, its ImageKit photos are kept. */
  existing?: boolean;
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
    slug: "30-pad-sanitary-napkin-vending-machine", name: "30-Pad Sanitary Napkin Vending Machine", category: "vending-machine", group: H,
    summary: "Compact coin-operated vending unit, ideal for schools and small washrooms.",
    overview: "A compact, coin-operated sanitary napkin vending machine with a 30-pad capacity, suited to schools and small washrooms.",
    features: [["Coin-operated", "Dispenses sanitary napkins against coins."], ["Compact unit", "Sized for schools and small washrooms."]],
    applications: [["Schools", "Easy access to sanitary napkins on campus."], ["Small washrooms", "A compact unit for limited space."]],
    specs: [["Capacity", "30 pads", "pads"], ["Operation", "Coin-operated"]],
    chips: ["30 pads", "Coin-operated", "Compact unit"], docSpecs: { dailyCapacity: "30 pads" },
  },
  {
    slug: "50-pad-sanitary-napkin-vending-machine", name: "50-Pad Sanitary Napkin Vending Machine", category: "vending-machine", group: H,
    summary: "Mid-capacity vending unit with a printed designer front panel.",
    overview: "A mid-capacity sanitary napkin vending machine holding 50 pads, finished with a printed designer front panel.",
    features: [["Printed designer front panel", "A decorative printed panel on the front of the unit."], ["Mid-size capacity", "Holds 50 pads."]],
    applications: [[HYGIENE_PLACES, "Menstrual hygiene access for institutions and public washrooms."]],
    specs: [["Capacity", "50 pads", "pads"], ["Front panel", "Printed designer panel"]],
    chips: ["50 pads", "Designer front panel"], docSpecs: { dailyCapacity: "50 pads" },
  },
  {
    slug: "100-pad-sanitary-napkin-vending-machine", name: "100-Pad Sanitary Napkin Vending Machine", category: "vending-machine", group: H,
    summary: "High-capacity steel-body vending unit for busy institutions.",
    overview: "A high-capacity sanitary napkin vending machine holding 100 pads in a steel body, built for busy institutions.",
    features: [["Steel body", "Robust steel construction."], ["High capacity", "Holds 100 pads."]],
    applications: [["Busy institutions", "High-footfall schools, colleges, hospitals and offices."]],
    specs: [["Capacity", "100 pads", "pads"], ["Body", "Steel"]],
    chips: ["100 pads", "Steel body"], docSpecs: { dailyCapacity: "100 pads" },
  },
  {
    slug: "automatic-sanitary-napkin-vending-machine", name: "Automatic Sanitary Napkin Vending Machine", category: "automatic-vending", group: H,
    summary: "Automatic dispensing with clear user instructions. 50-pad capacity.",
    overview: "An automatic sanitary napkin vending machine with a 50-pad capacity. It dispenses automatically and carries clear user instructions on the front.",
    features: [["Automatic dispensing", "Dispenses napkins automatically."], ["Clear user instructions", "Usage instructions displayed on the unit."]],
    applications: [[HYGIENE_PLACES, "Menstrual hygiene access for institutions and public washrooms."]],
    specs: [["Capacity", "50 pads", "pads"], ["Operation", "Automatic dispensing"]],
    chips: ["50 pads", "Automatic"], docSpecs: { dailyCapacity: "50 pads" },
  },
  {
    slug: "push-button-sanitary-napkin-vending-machine", name: "Push-Button Sanitary Napkin Vending Machine", category: "push-button-vending", group: H,
    summary: "Simple push-button operation, wall-mountable. 50-pad capacity.",
    overview: "A sanitary napkin vending machine with simple push-button operation and a 50-pad capacity. The unit can be wall-mounted.",
    features: [["Push-button operation", "Simple, one-step dispensing."], ["Wall-mountable", "Mounts on a wall to save floor space."]],
    applications: [[HYGIENE_PLACES, "Menstrual hygiene access for institutions and public washrooms."]],
    specs: [["Capacity", "50 pads", "pads"], ["Operation", "Push button"], ["Installation", "Wall-mountable"]],
    chips: ["50 pads", "Push button", "Wall-mountable"], docSpecs: { dailyCapacity: "50 pads" },
  },
  {
    slug: "sanitary-pad-disposal-machine-100-pad", name: "Sanitary Pad Disposal Machine — 100 Pad", category: "disposal-machine", group: H,
    summary: "Electric sanitary pad disposal machine, 100-pad variant.",
    overview: "An electric sanitary pad disposal machine, offered as the 100-pad variant, for washrooms in institutions and public facilities.",
    features: [["Electric operation", "Powered disposal unit."]],
    applications: [[HYGIENE_PLACES, "Disposal of used sanitary pads in washrooms."]],
    specs: [["Variant", "100-pad"]],
    chips: ["100-pad variant", "Electric"],
  },
  {
    slug: "sanitary-pad-disposal-machine", name: "Sanitary Pad Disposal Machine", category: "disposal-machine", group: H,
    summary: "Robust steel body with digital controls.",
    overview: "A sanitary pad disposal machine with a robust steel body and digital controls, for washrooms in institutions and public facilities.",
    features: [["Steel body", "Robust steel construction."], ["Digital controls", "Digital control panel."]],
    applications: [[HYGIENE_PLACES, "Disposal of used sanitary pads in washrooms."]],
    specs: [["Body", "Steel"], ["Controls", "Digital"]],
    chips: ["Steel body", "Digital controls"],
  },
  {
    slug: "sanitary-pad-disposal-machine-500-pad", name: "Sanitary Pad Disposal Machine — 500 Pad", category: "disposal-machine", group: H,
    summary: "Heavy-duty 500-pad variant for hostels and hospitals.",
    overview: "A heavy-duty sanitary pad disposal machine, offered as the 500-pad variant, for hostels and hospitals.",
    features: [["Heavy-duty build", "Designed for high-use sites."]],
    applications: [["Hostels", "Washrooms with many users."], ["Hospitals", "Disposal of used sanitary pads."]],
    specs: [["Variant", "500-pad"]],
    chips: ["500-pad variant", "Heavy-duty"],
  },
  {
    slug: "baby-diaper-vending-machine", name: "Baby Diaper Vending Machine", category: "vending-machine", group: H,
    summary: "Vending machine for baby diapers.",
    overview: "A vending machine for baby diapers, available from RMAX Solutions alongside its sanitary napkin vending range. Contact us for details.",
    chips: ["Baby diapers"],
  },
  {
    slug: "cloth-bag-vending-machine", name: "Cloth Bag Vending Machine", category: "vending-machine", group: H,
    summary: "Vending machine for cloth bags.",
    overview: "A vending machine for cloth bags, available from RMAX Solutions. Contact us for details.",
    chips: ["Cloth bags"],
  },

  /* ---------------- 2. Waste management & sanitation ---------------- */
  {
    slug: "wet-dry-dustbins", name: "Wet & Dry Dustbins", category: "waste-sanitation", group: W,
    summary: "Twin-bin, pedestal and community dustbins for source segregation in public places.",
    overview: "Wet and dry dustbins for segregating waste at source in public places, available as twin-bin, pedestal and community dustbins.",
    features: [["Wet and dry segregation", "Separate bins for wet and dry waste."], ["Multiple formats", "Twin-bin, pedestal and community dustbins."]],
    applications: [["Public places", "Source segregation of waste."]],
    chips: ["Wet & dry", "Twin-bin", "Pedestal", "Community"],
  },
  {
    slug: "wheelbarrows", name: "Wheelbarrows", category: "waste-sanitation", group: W,
    summary: "Heavy-duty steel wheelbarrows for sanitation workers and waste collection.",
    overview: "Heavy-duty steel wheelbarrows for sanitation workers and waste collection.",
    features: [["Heavy-duty steel", "Built for sanitation and waste-collection work."]],
    applications: [["Sanitation workers", "Moving collected waste."], ["Waste collection", "Handling waste on site."]],
    chips: ["Heavy-duty", "Steel"],
  },
  {
    slug: "mobile-toilets", name: "Mobile Toilets", category: "waste-sanitation", group: W,
    summary: "Portable toilet units for events, construction sites and public spaces.",
    overview: "Portable toilet units for events, construction sites and public spaces.",
    features: [["Portable", "Units can be placed where sanitation is needed."]],
    applications: [["Events", "Temporary toilet facilities."], ["Construction sites", "On-site sanitation."], ["Public spaces", "Additional public toilets."]],
    chips: ["Portable"],
  },
  {
    slug: "plastic-bottle-crusher-machine", name: "Plastic Bottle Crusher Machine", category: "waste-sanitation", group: W,
    summary: "Reverse-vending style crusher that reduces PET bottle volume at source.",
    overview: "A reverse-vending style plastic bottle crusher that reduces PET bottle volume at source, for railway stations, malls, campuses and public places.",
    features: [["Reverse-vending style", "Bottles are collected through a vending-style interface."], ["Volume reduction at source", "Reduces PET bottle volume where it is collected."]],
    applications: [["Railway stations", "PET bottle collection."], ["Malls", "PET bottle collection."], ["Campuses", "PET bottle collection."], ["Public places", "PET bottle collection."]],
    chips: ["PET bottles", "Reverse-vending style"],
  },
  {
    slug: "dust-remover-machine", name: "Dust Remover Machine", category: "plastic-waste-machinery", group: W, existing: true,
    summary: "Separates dust and loose contaminants from plastic waste ahead of shredding.",
    overview: "The Dust Remover Machine separates dust and loose contaminants from plastic waste using a blender-cum-impactor rotor inside a perforated drum, ahead of the shredding stage. It is built on a heavy frame structure.",
    features: [
      ["Perforated drum", "A 915 mm perforated drum casing separates dust from the waste."],
      ["Blender-cum-impactor rotor", "The rotor segregates dust and contaminants from the plastic."],
      ["Adjustable motor mounting", "Slot provision on the motor mount allows adjustment."],
      ["Heavy frame structure", "A heavy frame supports the machine."],
    ],
    applications: [["Plastic waste management units", "Cleaning collected plastic before shredding."]],
    specs: [
      ["Drum diameter", "915 mm (perforated casing)", "mm"], ["Drum length", "2100 mm", "mm"], ["Drum cover diameter", "1200 mm", "mm"],
      ["Machine output", "120–200 kg/hour", "kg/hour"], ["Rotor type", "Blender cum Impactor"], ["Main motor", "10–15 HP", "HP"],
      ["Motor speed", "1200–1600 RPM", "RPM"], ["Motor adjustment", "Slot provision provided"],
      ["Overall dimensions (L × W × H)", "1200 × 2550 × 1350 mm", "mm"], ["Frame", "Heavy frame structure"],
    ],
    chips: ["120–200 kg/hour", "10–15 HP", "915 mm drum"], docSpecs: { dailyCapacity: "120–200 kg/hour", power: "10–15 HP" },
  },
  {
    slug: "plastic-waste-shredder-machine", name: "Plastic Waste Shredder Machine with Weighing Accessories", category: "plastic-waste-machinery", group: W, existing: true,
    summary: "Reduces bulky plastic waste into smaller pieces, supplied with weighing equipment.",
    overview: "The Plastic Waste Shredder Machine reduces bulky plastic waste into smaller pieces using rotary and stationary blades. It is supplied with weighing equipment.",
    features: [
      ["1 tonne/day capacity", "Rated at 1 tonne per day."], ["Rotary and stationary blades", "4 rotary and 2 stationary blades."],
      ["10 HP motor", "Powered by a 10 HP motor."], ["Weighing equipment", "Stainless-steel weighing pan, 300 kg capacity, 50 g least count."],
    ],
    applications: [["Small-to-mid scale RRC facilities", "Compact footprint suited to smaller facilities."]],
    specs: [
      ["Capacity", "1 tonne/day", "tonne/day"], ["Machine size (L × W × H)", "1500 × 750 × 1500 mm (approx.)", "mm"],
      ["Rotary blades", "4"], ["Stationary blades", "2"], ["Motor", "10 HP", "HP"],
      ["Weighing equipment", "Stainless-steel pan"], ["Weighing capacity", "300 kg", "kg"], ["Weighing least count", "50 g", "g"],
      ["Weighing pan size", "450 × 550 mm", "mm"],
    ],
    chips: ["1 tonne/day", "10 HP", "4 + 2 blades", "300 kg weighing pan"], docSpecs: { dailyCapacity: "1 tonne/day", power: "10 HP" },
  },
  {
    slug: "plastic-bailing-machine", name: "Hydraulic Plastic Baling Machine", category: "plastic-waste-machinery", group: W, existing: true,
    summary: "Compresses loose or shredded plastic waste into bales for storage and transportation.",
    overview: "The Hydraulic Plastic Baling Machine compresses loose or shredded plastic waste into bales for storage and transportation. It uses hydraulic vertical clamping and a hydraulic gear cum plunger pump system.",
    features: [
      ["Hydraulic vertical clamping", "Compresses waste into bales."], ["Mild steel body", "8 mm body plate and 30 mm clamping plate."],
      ["Twin doors with two rope ties", "For securing and removing bales."], ["Hydraulic gear cum plunger pump", "Single-cylinder hydraulic system."],
      ["Electrical control", "Electrical control system."], ["1-year manufacturer warranty", "As listed in the catalogue."],
    ],
    applications: [["Plastic waste management units", "Baling plastic waste for storage."], ["Transportation", "Compact bales for easier handling."]],
    specs: [
      ["Clamping", "Hydraulic, vertical"], ["Body material", "Mild Steel (MS)"], ["Chamber dimensions (L × W × H)", "700 × 500 × 1400 mm", "mm"],
      ["Bale dimensions (L × W × H)", "700 × 500 × 650 mm", "mm"], ["Bale weight", "50–60 kg", "kg"], ["Number of cylinders", "1"],
      ["Pump", "Hydraulic gear cum plunger pump system"], ["Daylight gap (bottom plate)", "1400 mm", "mm"], ["Motor", "7.5 HP", "HP"],
      ["Rope ties", "2"], ["Doors", "2"], ["Body plate thickness", "8 mm", "mm"], ["Clamping plate thickness", "30 mm", "mm"],
      ["Control system", "Electrical"], ["Manufacturer warranty", "1 year"],
    ],
    chips: ["Hydraulic vertical", "7.5 HP", "50–60 kg bales", "1-year warranty"],
    docSpecs: { batchCapacity: "50–60 kg bale", power: "7.5 HP", chamber: "700 × 500 × 1400 mm", warranty: "1 year" },
    warranty: { duration: "1 Year", type: "Manufacturer Warranty", description: "One-year manufacturer warranty as listed in the catalogue." },
  },
  {
    slug: "composting-machine", name: "Composting Machine", category: "waste-sanitation", group: W,
    summary: "Converts organic and wet waste into nutrient-rich compost on site.",
    overview: "A composting machine that converts organic and wet waste into nutrient-rich compost on site.",
    features: [["On-site composting", "Converts organic and wet waste into compost."]],
    applications: [["Organic and wet waste", "Processing at the point of generation."]],
    chips: ["Organic waste", "On-site"],
  },
  {
    slug: "complete-pwmu-setup", name: "Complete Plastic Waste Management Unit (PWMU) Setup", category: "waste-sanitation", group: W,
    summary: "Turnkey solution: planning, machinery supply, installation and commissioning of processing units.",
    overview: "A turnkey Plastic Waste Management Unit setup covering end-to-end planning, machinery supply, installation and commissioning of processing units. Supplied for panchayats, municipal bodies and government departments.",
    features: [["End-to-end planning", "Planning of the processing unit."], ["Machinery supply", "Crushing, shredding, dust removal and baling machinery."], ["Installation and commissioning", "Delivered as a working unit."]],
    applications: [["Panchayats", "Turnkey PWMU projects."], ["Municipal bodies", "Turnkey PWMU projects."], ["Government departments", "Turnkey PWMU projects."]],
    chips: ["Turnkey", "Planning to commissioning"],
  },

  /* ---------------- 3. IoT & smart technology ---------------- */
  {
    slug: "toilet-feedback-machine", name: "Toilet Feedback Machine", category: "iot-smart-tech", group: I,
    summary: "Three-button IoT feedback system that captures user ratings in real time.",
    overview: "A three-button IoT feedback system that captures user ratings in real time. Suited to public toilets, Swachh Bharat monitoring and offices.",
    features: [["Three-button feedback", "Users rate with a button press."], ["Real-time ratings", "Ratings are captured in real time via IoT."]],
    applications: [["Public toilets", "Cleanliness feedback."], ["Swachh Bharat monitoring", "Tracking user ratings."], ["Offices", "Washroom feedback."]],
    specs: [["Feedback buttons", "3"], ["Connectivity", "IoT"]],
    chips: ["3 buttons", "IoT", "Real-time ratings"],
  },
  {
    slug: "gps-trackers", name: "GPS Trackers", category: "iot-smart-tech", group: I,
    summary: "Reliable location tracking for vehicles, assets and fleet management.",
    overview: "GPS trackers for reliable location tracking of vehicles and assets, and for fleet management applications.",
    features: [["Location tracking", "Tracks vehicles and assets."]],
    applications: [["Vehicles", "Location tracking."], ["Assets", "Location tracking."], ["Fleet management", "Fleet visibility."]],
    chips: ["Vehicles", "Assets", "Fleet"],
  },
  {
    slug: "usb-gps-receiver", name: "USB GPS Receiver", category: "iot-smart-tech", group: I,
    summary: "USB GPS receiver for location tracking applications.",
    overview: "A USB GPS receiver supplied alongside RMAX GPS trackers for location tracking applications.",
    chips: ["USB", "GPS"],
  },
  {
    slug: "max-can-obd-scanner", name: "MAX-CAN OBD Scanner", category: "iot-smart-tech", group: I,
    summary: "CAN-bus fleet diagnostics scanner for live vehicle health, fault codes and performance data.",
    overview: "The MAX-CAN OBD Scanner is a CAN-bus fleet diagnostics scanner providing live vehicle health, fault codes and performance data.",
    features: [["Live vehicle health", "Live health data from the vehicle."], ["Fault codes", "Reads vehicle fault codes."], ["Performance data", "Vehicle performance data."]],
    applications: [["Fleet diagnostics", "Monitoring vehicles in a fleet."]],
    chips: ["CAN-bus", "Fault codes", "Live data"],
  },
  {
    slug: "led-advertisement-screens", name: "LED Advertisement Screens", category: "iot-smart-tech", group: I,
    summary: "High-brightness indoor and outdoor LED displays for advertising and public information.",
    overview: "High-brightness indoor and outdoor LED displays for advertising and public information.",
    features: [["High brightness", "For indoor and outdoor use."]],
    applications: [["Advertising", "Digital advertising displays."], ["Public information", "Information displays."]],
    chips: ["Indoor", "Outdoor", "High brightness"],
  },
  {
    slug: "smart-iot-sensors", name: "Smart IoT Sensors", category: "iot-smart-tech", group: I,
    summary: "Connected sensors for monitoring, alerts and data logging across facilities.",
    overview: "Connected sensors for monitoring, alerts and data logging across facilities.",
    features: [["Monitoring", "Connected facility monitoring."], ["Alerts", "Alerts from sensor readings."], ["Data logging", "Logged sensor data."]],
    applications: [["Facilities", "Monitoring across facilities."]],
    chips: ["Monitoring", "Alerts", "Data logging"],
  },
  {
    slug: "home-automation-solutions", name: "Home Automation Solutions", category: "iot-smart-tech", group: I,
    summary: "Smart control of lights, appliances and security for homes and offices.",
    overview: "Home automation solutions for smart control of lights, appliances and security in homes and offices.",
    features: [["Lights and appliances", "Smart control."], ["Security", "Smart security control."]],
    applications: [["Homes", "Smart control."], ["Offices", "Smart control."]],
    chips: ["Lights", "Appliances", "Security"],
  },
];
