# 🌿 BitCamp — অনলাইন সাপ্লিমেন্ট বিজনেস সিস্টেম

ল্যান্ডিং পেজ + অর্ডার ম্যানেজমেন্ট + Steadfast কুরিয়ার ইন্টিগ্রেশন + অ্যাডমিন প্যানেল — সব একসাথে।
Next.js (App Router) + PostgreSQL (Drizzle ORM) দিয়ে তৈরি।

## দ্রুত শুরু

```bash
npm install            # ডিপেনডেন্সি
cp .env.example .env   # .env ফাইল বানান (DATABASE_URL, ADMIN_PASSWORD দিন)
npx drizzle-kit push   # ডেটাবেজ টেবিল তৈরি
npm run dev            # http://localhost:3000
```

## পেজগুলো

| পাথ | কী |
|------|-----|
| `/` | ল্যান্ডিং পেজ + COD অর্ডার ফর্ম |
| `/thank-you` | অর্ডার সফল পেজ |
| `/admin` | ড্যাশবোর্ড |
| `/admin/manual` | 📗 কীভাবে ADD করবেন ও চালাবেন (ধাপে ধাপে) |
| `/admin/orders` | অর্ডার লিস্ট — যাচাই, কনফার্ম, Fake/Incomplete, হাতে অর্ডার |
| `/admin/couriers` | কুরিয়ার হিস্ট্রি + স্ট্যাটাস আপডেট |
| `/admin/settings` | দাম, টেক্সট, ডেলিভারি চার্জ |
| `/admin/guide` | 📘 বিজনেস গাইড |
| `/api/webhook/steadfast` | কুরিয়ার স্ট্যাটাস ওয়েবহুক |

## ডকুমেন্টেশন

| ফাইল | কী আছে |
|------|--------|
| **`DEPLOY.md`** | 🆓 ফ্রি হোস্টিং (Vercel/Neon/Render) + ডোমেইন — ধাপে ধাপে |
| **`OPERATIONS.md`** | 📗 প্রতিদিনের কাজ — অর্ডার ADD, কনফার্ম, কুরিয়ার, রুটিন |
| **`TESTING.md`** | ✅ নিজে নিজে টেস্ট করার চেকলিস্ট |

## পরিবেশ ভেরিয়েবল

`.env.example` দেখুন। মূল ভেরিয়েবল: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`,
`STEADFAST_API_KEY`, `STEADFAST_SECRET_KEY`, `STEADFAST_WEBHOOK_TOKEN`।
