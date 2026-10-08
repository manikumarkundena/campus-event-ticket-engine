const routes = [
  '/',
  '/events',
  '/login',
  '/register',
  '/dashboard',
  '/my-bookings',
  '/organizer/dashboard',
  '/organizer/events/new',
  '/gate/validate',
  '/admin/dashboard',
];

async function checkAll() {
  console.log('🔍 Verifying all Next.js frontend pages on http://localhost:3000...\n');
  let passed = 0;
  for (const route of routes) {
    try {
      const url = `http://localhost:3000${route}`;
      const res = await fetch(url);
      const text = await res.text();
      const isOk = res.status === 200 && text.length > 500;
      if (isOk) {
        console.log(`✅ [200 OK] ${route.padEnd(25)} (${text.length} bytes HTML rendered)`);
        passed++;
      } else {
        console.log(`❌ [${res.status}] ${route.padEnd(25)} (length: ${text.length})`);
      }
    } catch (err) {
      console.log(`❌ [ERR] ${route.padEnd(25)} - ${err.message}`);
    }
  }

  console.log(`\n🎯 Summary: ${passed} / ${routes.length} pages verified successfully.`);
  if (passed === routes.length) {
    console.log('🎉 All routes healthy and rendering.');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

checkAll();
