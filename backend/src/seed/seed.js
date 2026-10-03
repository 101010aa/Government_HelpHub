import "dotenv/config";
import connectDB from "../config/db.js";
import { User, Category, Helpline } from "../models/index.js";

const CATEGORY_SEEDS = [
  ["Emergency", "Emergency service information", "✳"],
  ["Police", "Police and public safety services", "◈"],
  ["Fire & Rescue", "Fire and rescue services", "♨"],
  ["Health", "Health and medical services", "+"],
  ["Women", "Support services for women", "◇"],
  ["Children", "Child protection and support", "⌂"],
  ["Disaster", "Disaster response and preparedness", "⌁"],
  ["Traffic", "Traffic and road safety services", "↗"],
  ["Government Complaints", "Public body questions, complaints, and suggestions", "▤"],
  ["Consumer Protection", "Consumer rights and protection services", "◎"],
  ["Electricity", "Electricity utility services", "ϟ"],
  ["Water", "Water utility services", "◌"],
  ["Transport", "Public transport services", "⌖"],
  ["Other", "Other public service information", "◈"],
];

const PUBLIC_GRIEVANCE_SERVICE = {
  name: "Public Grievance & Suggestions",
  number: "1111",
  description:
    "A public grievance and suggestions service operated by the Office of the Prime Minister and Council of Ministers.",
  purpose:
    "Submit questions, grievances, or suggestions about the work and services of public bodies.",
  operator: "Office of the Prime Minister and Council of Ministers",
  governmentBody: "Office of the Prime Minister and Council of Ministers (OPMCM)",
  availability:
    "24/7 operation was reported by the telecom provider in 2023; confirm current availability with OPMCM.",
  isTollFree: true,
  eligibility:
    "For people with questions, grievances, or suggestions concerning public body activities and public services.",
  services: [
    "Register a complaint or grievance online through the official OPMCM portal.",
    "Track an existing complaint using its ticket details on the official portal.",
    "Send complaints and suggestions by hotline, email, SMS, WhatsApp, Viber, Facebook, or X.",
    "The official site publishes complaint summaries and service status statistics; these change over time and are not copied into this directory.",
    "Office address: Office of the Prime Minister and Council of Ministers, Singhadurbar, Kathmandu, Nepal.",
    "Fax: 1100. Postal contact: Office of the Prime Minister and Council of Ministers, Singhadurbar, Kathmandu, Nepal.",
  ],
  contactChannels: [
    { channel: "Hotline", value: "1111", url: "tel:1111" },
    {
      channel: "Office telephone",
      value: "01-5970087",
      url: "tel:+97715970087",
    },
    {
      channel: "Email",
      value: "1111@nepal.gov.np",
      url: "mailto:1111@nepal.gov.np",
    },
    {
      channel: "SMS",
      value: "+977-9851145045",
      url: "sms:+9779851145045",
    },
    {
      channel: "WhatsApp",
      value: "+977-9851145045",
      url: "https://wa.me/9779851145045",
    },
    {
      channel: "Viber",
      value: "+977-9851145045",
      url: "",
    },
    {
      channel: "Facebook",
      value: "Official OPMCM grievance service",
      url: "https://www.facebook.com/hellosarkar.np/",
    },
    {
      channel: "X (Twitter)",
      value: "@hello_sarkar",
      url: "https://x.com/hello_sarkar/",
    },
    { channel: "Fax", value: "1100", url: "tel:1100" },
    {
      channel: "Postal address",
      value: "Office of the Prime Minister and Council of Ministers, Singhadurbar, Kathmandu, Nepal",
      url: "",
    },
  ],
  officialWebsite: "https://gunaso.opmcm.gov.np/",
  sourceUrl: "https://gunaso.opmcm.gov.np/",
  additionalSources: [
    {
      label: "Official contact and FAQ pages",
      url: "https://gunaso.opmcm.gov.np/faqs",
    },
    {
      label: "OPMCM contact page",
      url: "https://www.opmcm.gov.np/en",
    },
    {
      label: "Telecom provider announcement on toll-free 24/7 access",
      url: "https://www.ncell.com.np/en/about/media-room/press-release/ncell-collaborates-with-government-to-facilitate-hello-sarkar-1111-247",
    },
  ],
  lastVerifiedAt: new Date(),
  isVerified: true,
  isActive: true,
};

async function seedCategories() {
  const categories = new Map();
  for (const [name, description, icon] of CATEGORY_SEEDS) {
    const category = await Category.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, description, icon, isActive: true } },
      { new: true, upsert: true, runValidators: true },
    );
    categories.set(name, category);
  }
  return categories;
}

async function seedAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.");
  }
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  if (!(await User.exists({ email }))) {
    await User.create({
      name: process.env.ADMIN_NAME || "Hub Administrator",
      email,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });
  }
}

async function seedPublicGrievanceService(categories) {
  const legacy = await Helpline.findOne({
    number: "1111",
    operator: /Office of the Prime Minister and Council of Ministers/i,
  });
  const query = legacy
    ? { _id: legacy._id }
    : {
        name: PUBLIC_GRIEVANCE_SERVICE.name,
        number: PUBLIC_GRIEVANCE_SERVICE.number,
      };
  const { lastVerifiedAt, ...listing } = PUBLIC_GRIEVANCE_SERVICE;
  await Helpline.findOneAndUpdate(
    query,
    {
      $set: {
        ...listing,
        category: categories.get("Government Complaints")._id,
      },
      $setOnInsert: { lastVerifiedAt },
    },
    { upsert: true, runValidators: true, new: true },
  );
}

try {
  await connectDB();
  const categories = await seedCategories();
  await seedAdmin();
  await seedPublicGrievanceService(categories);
  console.log(
    "Seed complete: categories, initial administrator, and source-backed public grievance listing are ready.",
  );
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  const { default: mongoose } = await import("mongoose");
  await mongoose.disconnect();
}
