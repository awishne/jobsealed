/**
 * Quick test for /api/waitlist: first request -> joined, second (same email) -> already_joined.
 * Start dev server first: npm run dev
 * Run: node scripts/test-waitlist.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function post(email, source = "script", query = "") {
  const url = `${BASE}/api/waitlist${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const unique = `test-waitlist-${Date.now()}@example.com`;
  const utmQuery = "utm_source=test&utm_campaign=waitlist_script";

  console.log("1. New email (with UTM params) -> expect joined");
  const r1 = await post(unique, "script", utmQuery);
  console.log("   Status:", r1.status, "Body:", JSON.stringify(r1.data));
  if (r1.status !== 200 || r1.data?.status !== "joined") {
    console.error("   FAIL: expected 200 and status joined");
    process.exit(1);
  }
  console.log("   OK\n");

  console.log("2. Same email -> expect already_joined");
  const r2 = await post(unique);
  console.log("   Status:", r2.status, "Body:", JSON.stringify(r2.data));
  if (r2.status !== 200 || r2.data?.status !== "already_joined") {
    console.error("   FAIL: expected 200 and status already_joined");
    process.exit(1);
  }
  console.log("   OK\n");

  console.log("All checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
