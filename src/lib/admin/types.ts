export interface KpiData {
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeInstitutions: number;
  institutionsGrowth: number;
}

export interface SalesMonthPoint {
  month: string;
  orders: number;
  revenue: number; // in INR
}

export interface BestSellerProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  specs: string;
  ordersCount: number;
  image: string;
  price: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  institution: string;
  product: string;
  productSlug: string;
  amount: number;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  date: string;
  createdAt: string;
}

export interface AdminEnquiry {
  id: string;
  customerName: string;
  initials: string;
  institution: string;
  timeAgo: string;
  messagePreview: string;
  status: "new" | "in-progress" | "resolved";
  date: string;
  email: string;
  phone?: string;
  modelInterest?: string;
}

export interface ServiceSummary {
  completed: number;
  inProgress: number;
  scheduled: number;
  pending: number;
  total: number;
}

export interface ServiceRequestItem {
  id: string;
  ticketId: string;
  institution: string;
  location: string;
  serviceType: "Installation" | "Routine Maintenance" | "Heating Element Check" | "Filter Replacement" | "Emergency Repair" | "Inspection";
  model: string;
  status: "Completed" | "In Progress" | "Scheduled" | "Pending";
  priority: "High" | "Medium" | "Low";
  scheduledDate: string;
  technician: string;
}

export interface InstitutionItem {
  id: string;
  name: string;
  type: "School" | "College / University" | "Hospital" | "Workplace" | "Government" | string;
  city: string;
  state: string;
  contactPerson: string;
  email: string;
  phone: string;
  unitsInstalled: number;
  status: "Active" | "Pending Installation" | "Pending" | "Inactive";
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: "Finished Machines" | "Spare Parts" | "Heating Coils" | "Filters" | "Vending Machines" | string;
  inStock: number;
  allocated?: number;
  reorderPoint: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  unitCost: number;
  lastRestocked?: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Operations Admin" | "Service Manager" | "Support Staff" | "Manager" | "Customer";
  status: "Active" | "Inactive";
  lastActive: string;
  department?: string;
}

/** Baseline reference data matching the PRD specification exactly */
export const DEFAULT_KPIS: KpiData = {
  totalOrders: 248,
  ordersGrowth: 12,
  totalCustomers: 1856,
  customersGrowth: 18,
  totalRevenue: 1248000,
  revenueGrowth: 24,
  activeInstitutions: 320,
  institutionsGrowth: 15,
};

export const DEFAULT_SALES_OVERVIEW: SalesMonthPoint[] = [
  { month: "Apr", orders: 140, revenue: 850000 },
  { month: "May", orders: 195, revenue: 1040000 },
  { month: "Jun", orders: 215, revenue: 1120000 },
  { month: "Jul", orders: 250, revenue: 1280000 },
  { month: "Aug", orders: 310, revenue: 1490000 },
  { month: "Sep", orders: 380, revenue: 1720000 },
];

export const DEFAULT_BEST_SELLERS: BestSellerProduct[] = [
  {
    id: "prod-basic",
    slug: "basic",
    name: "Napkin Incinerator (Basic)",
    title: "Napkin Incinerator (Basic)",
    specs: "800W • 8kg • 80-100/day",
    ordersCount: 125,
    image: "/images/products/list-basic.png",
    price: 3000,
  },
  {
    id: "prod-pro",
    slug: "pro",
    name: "Napkin Incinerator (Pro)",
    title: "Napkin Incinerator (Pro)",
    specs: "1000W • 9kg • 200-250/day",
    ordersCount: 98,
    image: "/images/products/list-pro.png",
    price: 4500,
  },
  {
    id: "prod-pro-max",
    slug: "pro-max",
    name: "Napkin Incinerator (Pro-Max)",
    title: "Napkin Incinerator (Pro-Max)",
    specs: "1200W • 10kg • 400-500/day",
    ordersCount: 76,
    image: "/images/products/list-pro-max.png",
    price: 6500,
  },
];

export const DEFAULT_RECENT_ORDERS: AdminOrder[] = [
  {
    id: "ord-1523",
    orderNumber: "#1523",
    customerName: "Balbir Singhania",
    institution: "Singhania School",
    product: "Pro-Max",
    productSlug: "pro-max",
    amount: 6500,
    status: "Delivered",
    date: "25 Oct 2026",
    createdAt: "2026-10-25T11:30:00Z",
  },
  {
    id: "ord-1522",
    orderNumber: "#1522",
    customerName: "Dr. Meera Iyer",
    institution: "Sunrise Public School",
    product: "Pro",
    productSlug: "pro",
    amount: 4500,
    status: "Shipped",
    date: "24 Oct 2026",
    createdAt: "2026-10-24T14:15:00Z",
  },
  {
    id: "ord-1521",
    orderNumber: "#1521",
    customerName: "Principal N. Sharma",
    institution: "Jain College, Jaipur",
    product: "Basic",
    productSlug: "basic",
    amount: 3000,
    status: "Processing",
    date: "24 Oct 2026",
    createdAt: "2026-10-24T09:45:00Z",
  },
  {
    id: "ord-1520",
    orderNumber: "#1520",
    customerName: "Rajesh Khanna",
    institution: "City Hospital",
    product: "Pro-Max",
    productSlug: "pro-max",
    amount: 6500,
    status: "Delivered",
    date: "23 Oct 2026",
    createdAt: "2026-10-23T16:20:00Z",
  },
  {
    id: "ord-1519",
    orderNumber: "#1519",
    customerName: "Ananya Rao",
    institution: "Greenwood School",
    product: "Pro",
    productSlug: "pro",
    amount: 4500,
    status: "Cancelled",
    date: "22 Oct 2026",
    createdAt: "2026-10-22T10:00:00Z",
  },
];

export const DEFAULT_RECENT_ENQUIRIES: AdminEnquiry[] = [
  {
    id: "enq-001",
    customerName: "Amit Sharma",
    initials: "AS",
    institution: "Delhi Public School",
    timeAgo: "2 hours ago",
    messagePreview: "Need quote for 2 Pro-Max units for our new wing washrooms.",
    status: "new",
    date: "27 Oct 2026",
    email: "asharma@dpsdelhi.edu.in",
    phone: "+91 98110 23456",
    modelInterest: "Pro-Max",
  },
  {
    id: "enq-002",
    customerName: "Priya Khanna",
    initials: "PK",
    institution: "Sunrise School",
    timeAgo: "4 hours ago",
    messagePreview: "Interested in Pro model. Please share details regarding power consumption.",
    status: "new",
    date: "27 Oct 2026",
    email: "priya.k@sunriseschool.org",
    phone: "+91 97230 45678",
    modelInterest: "Pro",
  },
  {
    id: "enq-003",
    customerName: "Rajesh Mehta",
    initials: "RS",
    institution: "City Hospital",
    timeAgo: "6 hours ago",
    messagePreview: "Need installation service in Jaipur hospital staff quarters.",
    status: "in-progress",
    date: "27 Oct 2026",
    email: "rmehta@cityhospital.in",
    phone: "+91 94140 12389",
    modelInterest: "Installation Support",
  },
  {
    id: "enq-004",
    customerName: "Neha Dua",
    initials: "ND",
    institution: "Green Campus",
    timeAgo: "1 day ago",
    messagePreview: "Looking for bulk order discount on 5 Basic incinerator units.",
    status: "new",
    date: "26 Oct 2026",
    email: "neha.dua@greencampus.org",
    phone: "+91 99880 77665",
    modelInterest: "Basic",
  },
];

export const DEFAULT_SERVICE_SUMMARY: ServiceSummary = {
  completed: 28,
  inProgress: 8,
  scheduled: 4,
  pending: 2,
  total: 42,
};

export const DEFAULT_SERVICE_REQUESTS: ServiceRequestItem[] = [
  {
    id: "sr-101",
    ticketId: "SR-2026-101",
    institution: "Delhi Public School",
    location: "Mathura Road, New Delhi",
    serviceType: "Installation",
    model: "Pro-Max (2 units)",
    status: "Scheduled",
    priority: "High",
    scheduledDate: "28 Oct 2026",
    technician: "Ramesh Verma",
  },
  {
    id: "sr-102",
    ticketId: "SR-2026-102",
    institution: "City Hospital",
    location: "Civil Lines, Jaipur",
    serviceType: "Routine Maintenance",
    model: "Pro-Max",
    status: "In Progress",
    priority: "Medium",
    scheduledDate: "27 Oct 2026",
    technician: "Vikram Sen",
  },
  {
    id: "sr-103",
    ticketId: "SR-2026-103",
    institution: "Sunrise School",
    location: "Sector 14, Gurugram",
    serviceType: "Heating Element Check",
    model: "Pro",
    status: "Completed",
    priority: "Low",
    scheduledDate: "25 Oct 2026",
    technician: "Anil Kumar",
  },
  {
    id: "sr-104",
    ticketId: "SR-2026-104",
    institution: "Jain College",
    location: "Bapu Nagar, Jaipur",
    serviceType: "Filter Replacement",
    model: "Basic",
    status: "Pending",
    priority: "Medium",
    scheduledDate: "29 Oct 2026",
    technician: "Pending Assignment",
  },
];

export const DEFAULT_INSTITUTIONS: InstitutionItem[] = [
  {
    id: "inst-1",
    name: "Singhania School",
    type: "School",
    city: "Jaipur",
    state: "Rajasthan",
    contactPerson: "Balbir Singhania",
    email: "contact@singhaniaschool.org",
    phone: "+91 94140 55667",
    unitsInstalled: 4,
    status: "Active",
  },
  {
    id: "inst-2",
    name: "Sunrise Public School",
    type: "School",
    city: "Pune",
    state: "Maharashtra",
    contactPerson: "Dr. Meera Iyer",
    email: "facilities@sunrisepublic.in",
    phone: "+91 98220 11223",
    unitsInstalled: 6,
    status: "Active",
  },
  {
    id: "inst-3",
    name: "City Hospital",
    type: "Hospital",
    city: "Jaipur",
    state: "Rajasthan",
    contactPerson: "Rajesh Khanna",
    email: "hygiene@cityhospital.in",
    phone: "+91 94140 99887",
    unitsInstalled: 12,
    status: "Active",
  },
  {
    id: "inst-4",
    name: "Jain College",
    type: "College / University",
    city: "Jaipur",
    state: "Rajasthan",
    contactPerson: "Principal N. Sharma",
    email: "admin@jaincollege.ac.in",
    phone: "+91 94141 22334",
    unitsInstalled: 3,
    status: "Active",
  },
  {
    id: "inst-5",
    name: "Greenwood International School",
    type: "School",
    city: "Bengaluru",
    state: "Karnataka",
    contactPerson: "Ananya Rao",
    email: "care@greenwood.edu.in",
    phone: "+91 98450 33445",
    unitsInstalled: 5,
    status: "Active",
  },
  {
    id: "inst-6",
    name: "CareFirst Medical Center",
    type: "Hospital",
    city: "Bengaluru",
    state: "Karnataka",
    contactPerson: "Dr. S. Nair",
    email: "info@carefirst.org",
    phone: "+91 98451 88990",
    unitsInstalled: 8,
    status: "Active",
  },
];

export const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "RMAX-INC-BSC",
    name: "Napkin Incinerator Basic (800W)",
    category: "Finished Machines",
    inStock: 42,
    allocated: 12,
    reorderPoint: 15,
    status: "In Stock",
    unitCost: 1800,
  },
  {
    id: "inv-2",
    sku: "RMAX-INC-PRO",
    name: "Napkin Incinerator Pro (1000W)",
    category: "Finished Machines",
    inStock: 28,
    allocated: 8,
    reorderPoint: 10,
    status: "In Stock",
    unitCost: 2600,
  },
  {
    id: "inv-3",
    sku: "RMAX-INC-MAX",
    name: "Napkin Incinerator Pro-Max (1200W)",
    category: "Finished Machines",
    inStock: 19,
    allocated: 7,
    reorderPoint: 8,
    status: "In Stock",
    unitCost: 3900,
  },
  {
    id: "inv-4",
    sku: "RMAX-PAD-VND",
    name: "Coin Pad Vending Machine",
    category: "Finished Machines",
    inStock: 6,
    allocated: 2,
    reorderPoint: 5,
    status: "Low Stock",
    unitCost: 3200,
  },
  {
    id: "inv-5",
    sku: "SP-COIL-1200W",
    name: "Heavy Duty Heating Coil 1200W",
    category: "Heating Coils",
    inStock: 85,
    allocated: 14,
    reorderPoint: 25,
    status: "In Stock",
    unitCost: 450,
  },
  {
    id: "inv-6",
    sku: "SP-FLTR-CRBN",
    name: "Activated Carbon Odour Filter",
    category: "Filters",
    inStock: 140,
    allocated: 20,
    reorderPoint: 50,
    status: "In Stock",
    unitCost: 180,
  },
];

export const DEFAULT_ADMIN_USERS: AdminUserItem[] = [
  {
    id: "usr-1",
    name: "Rahul Kumawat",
    email: "rahul@rmaxsolutions.in",
    role: "Super Admin",
    status: "Active",
    lastActive: "Just now",
  },
  {
    id: "usr-2",
    name: "Asha Rao",
    email: "facilities@example.org",
    role: "Operations Admin",
    status: "Active",
    lastActive: "10 mins ago",
  },
  {
    id: "usr-3",
    name: "Vikram Sen",
    email: "service@rmaxsolutions.in",
    role: "Service Manager",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    id: "usr-4",
    name: "Pooja Deshmukh",
    email: "support@rmaxsolutions.in",
    role: "Support Staff",
    status: "Active",
    lastActive: "Yesterday",
  },
];
