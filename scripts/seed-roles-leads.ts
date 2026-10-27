import { config } from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/models/User";
import { Lead } from "../src/models/Lead";
import { Notification } from "../src/models/Notification";
import { AuditLog } from "../src/models/AuditLog";

config({ path: ".env.local" });
config();

async function main() {
  console.log("Connecting to database...");
  await connectDB();
  console.log("Connected.");

  // 1. Seed Super Admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "rmaxadmin@gmail.com";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "rmaxadmin123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  let superAdmin = await User.findOne({ email: adminEmail });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: "super_admin",
      status: "active",
      department: "Executive",
    });
    console.log(`✔ Created Super Admin (${adminEmail})`);
  } else {
    superAdmin.name = "Super Admin";
    superAdmin.role = "super_admin";
    superAdmin.status = "active";
    superAdmin.passwordHash = adminHash;
    await superAdmin.save();
    console.log(`✔ Updated Super Admin (${adminEmail})`);
  }

  // 2. Seed Managers
  const manager1Email = process.env.MANAGER_EMAIL || "rmaxmanager@gmail.com";
  const manager1Password = process.env.MANAGER_PASSWORD || "rmaxmanager123";
  const manager1Hash = await bcrypt.hash(manager1Password, 10);

  let manager1 = await User.findOne({ email: manager1Email });
  if (!manager1) {
    manager1 = await User.create({
      name: "RMAX Manager",
      email: manager1Email,
      passwordHash: manager1Hash,
      role: "manager",
      status: "active",
      department: "Institutional Sales",
    });
    console.log(`✔ Created Manager 1 (${manager1Email})`);
  } else {
    manager1.name = "RMAX Manager";
    manager1.role = "manager";
    manager1.status = "active";
    manager1.passwordHash = manager1Hash;
    await manager1.save();
    console.log(`✔ Updated Manager 1 (${manager1Email})`);
  }

  const manager2Email = "priya.manager@rmax.in";
  const manager2Password = "Manager@123456";
  const manager2Hash = await bcrypt.hash(manager2Password, 10);

  let manager2 = await User.findOne({ email: manager2Email });
  if (!manager2) {
    manager2 = await User.create({
      name: "Priya Sharma",
      email: manager2Email,
      passwordHash: manager2Hash,
      role: "manager",
      status: "active",
      department: "Healthcare & Hospitals",
    });
    console.log(`✔ Created Manager 2 (${manager2Email})`);
  } else {
    manager2.role = "manager";
    manager2.status = "active";
    manager2.passwordHash = manager2Hash;
    await manager2.save();
    console.log(`✔ Updated Manager 2 (${manager2Email})`);
  }

  // 3. Seed Sample Leads
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
  const overdueDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const upcomingDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // in 3 days

  await Lead.deleteMany({});
  console.log("Cleaned existing leads for fresh seed.");

  const sampleLeads = [
    {
      leadNumber: "LD-1001",
      name: "Dr. Arvind Gupta",
      email: "principal@dpsjaipur.edu.in",
      phone: "+91 98290 12345",
      institution: "DPS International School",
      institutionType: "Schools",
      source: "website",
      status: "contacted",
      priority: "urgent",
      assignedManager: manager1._id,
      assignedManagerName: manager1.name,
      assignedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      assignedBy: superAdmin._id,
      createdBy: superAdmin._id,
      preferredModel: "pro-max",
      quantity: 8,
      estimatedValue: 45000,
      nextFollowUpAt: today,
      lastContactedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      notes: "Requirements for 8 napkin incinerator units for girls hostel blocks.",
      activities: [
        {
          type: "status_change",
          description: "Website enquiry received.",
          performedBy: superAdmin._id,
          performedByName: superAdmin.name,
          createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        },
        {
          type: "assignment",
          description: `Assigned to ${manager1.name}.`,
          performedBy: superAdmin._id,
          performedByName: superAdmin.name,
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          type: "call",
          description: "Discussed Pro-Max model technical specs. Demo scheduled for today.",
          performedBy: manager1._id,
          performedByName: manager1.name,
          createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        },
      ],
      isArchived: false,
    },
    {
      leadNumber: "LD-1002",
      name: "Meenakshi Rao",
      email: "procurement@cityhospital.org",
      phone: "+91 94140 67890",
      institution: "City Care Super Specialty Hospital",
      institutionType: "Hospitals",
      source: "referral",
      status: "contacted",
      priority: "high",
      assignedManager: manager1._id,
      assignedManagerName: manager1.name,
      assignedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      assignedBy: superAdmin._id,
      createdBy: superAdmin._id,
      preferredModel: "pro",
      quantity: 5,
      estimatedValue: 65000,
      nextFollowUpAt: overdueDate,
      lastContactedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      notes: "Heavy duty bio-medical sanitary disposal required for nurse quarters.",
      activities: [
        {
          type: "status_change",
          description: "Referral from Dr. Sharma.",
          performedBy: superAdmin._id,
          performedByName: superAdmin.name,
          createdAt: new Date(now.getTime() - 96 * 60 * 60 * 1000),
        },
      ],
      isArchived: false,
    },
    {
      leadNumber: "LD-1003",
      name: "Prof. Suresh Patil",
      email: "registrar@apexuniversity.ac.in",
      phone: "+91 97850 54321",
      institution: "Apex University Central Campus",
      institutionType: "Schools",
      source: "institutional_quote",
      status: "qualified",
      priority: "medium",
      assignedManager: manager2._id,
      assignedManagerName: manager2.name,
      assignedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      assignedBy: superAdmin._id,
      createdBy: superAdmin._id,
      preferredModel: "pro-max",
      quantity: 15,
      estimatedValue: 120000,
      nextFollowUpAt: upcomingDate,
      lastContactedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      notes: "Annual institutional campus hygiene overhaul contract.",
      activities: [
        {
          type: "status_change",
          description: "Institutional quote documentation submitted.",
          performedBy: superAdmin._id,
          performedByName: superAdmin.name,
          createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
        },
      ],
      isArchived: false,
    },
    {
      leadNumber: "LD-1004",
      name: "Vikram Malhotra",
      email: "facilities@techparkhostels.com",
      phone: "+91 99280 98765",
      institution: "TechPark Corporate Residences",
      institutionType: "Hostels",
      source: "manual",
      status: "new",
      priority: "high",
      createdBy: superAdmin._id,
      preferredModel: "basic",
      quantity: 4,
      estimatedValue: 35000,
      notes: "Unassigned enquiry from business expo.",
      activities: [
        {
          type: "status_change",
          description: "Collected contact card at Expo.",
          performedBy: superAdmin._id,
          performedByName: superAdmin.name,
          createdAt: new Date(),
        },
      ],
      isArchived: false,
    },
    {
      leadNumber: "LD-1005",
      name: "Sister Anita Joshi",
      email: "admin@stmarygirlscollege.in",
      phone: "+91 98288 11223",
      institution: "St. Mary Girls College",
      institutionType: "Schools",
      source: "direct_call",
      status: "converted",
      priority: "urgent",
      assignedManager: manager1._id,
      assignedManagerName: manager1.name,
      assignedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      assignedBy: superAdmin._id,
      createdBy: superAdmin._id,
      preferredModel: "pro",
      quantity: 10,
      estimatedValue: 80000,
      lastContactedAt: new Date(),
      notes: "Order finalized for 10 Pro incinerator machines.",
      activities: [
        {
          type: "status_change",
          description: "Purchase order received and forwarded to dispatch.",
          performedBy: manager1._id,
          performedByName: manager1.name,
          createdAt: new Date(),
        },
      ],
      isArchived: false,
    },
  ];

  await Lead.insertMany(sampleLeads);
  console.log(`✔ Seeded ${sampleLeads.length} sample leads`);

  // 4. Seed initial notifications
  await Notification.deleteMany({});
  await Notification.insertMany([
    {
      title: "New Institutional Lead Assigned",
      message: "Lead LD-1001 (DPS International School) has been assigned to you.",
      type: "lead_assigned",
      targetRole: "manager",
      entityType: "lead",
      recipient: manager1._id,
      link: "/manager/leads",
      isRead: false,
    },
    {
      title: "Overdue Follow-Up Alert",
      message: "Follow-up for Lead LD-1002 (City Care Hospital) is past due.",
      type: "followup_overdue",
      targetRole: "manager",
      entityType: "lead",
      recipient: manager1._id,
      link: "/manager/follow-ups",
      isRead: false,
    },
    {
      title: "High Value Lead Converted",
      message: "Lead LD-1005 (St. Mary Girls College) converted by RMAX Manager.",
      type: "lead_status_changed",
      targetRole: "super_admin",
      entityType: "lead",
      link: "/admin/leads",
      isRead: false,
    },
  ]);
  console.log("✔ Seeded initial test notifications");

  // 5. Seed initial audit log
  await AuditLog.deleteMany({});
  await AuditLog.insertMany([
    {
      actor: superAdmin._id,
      actorName: superAdmin.name,
      actorEmail: superAdmin.email,
      actorRole: "super_admin",
      action: "manager_created",
      entityType: "user",
      entityId: manager1._id.toString(),
      metadata: { managerName: manager1.name, department: manager1.department },
      timestamp: new Date(),
    },
    {
      actor: superAdmin._id,
      actorName: superAdmin.name,
      actorEmail: superAdmin.email,
      actorRole: "super_admin",
      action: "lead_assigned",
      entityType: "lead",
      entityId: "LD-1001",
      metadata: { leadNumber: "LD-1001", assignedTo: manager1.name },
      timestamp: new Date(),
    },
  ]);
  console.log("✔ Seeded initial audit logs");

  console.log("\n=================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Credentials:");
  console.log(`• Super Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`• Manager 1:   ${manager1Email} / ${manager1Password}`);
  console.log(`• Manager 2:   ${manager2Email} / ${manager2Password}`);
  console.log("=================================\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
