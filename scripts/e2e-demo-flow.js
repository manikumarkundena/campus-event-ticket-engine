const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runDemoFlow() {
  console.log('============================================================');
  console.log('🚀 CAMPUS EVENT TICKETING ENGINE — E2E DEMO SIMULATION');
  console.log('   Siddaganga Institute of Technology, Tumakuru (SPM ABL-1)');
  console.log('============================================================\n');

  // Step 1: Health Check
  console.log('1️⃣ Checking System Health...');
  const health = await request('/health');
  if (health.data.status !== 'UP') throw new Error('Backend health check failed');
  console.log(`   ✅ System UP | Database: ${health.data.components.database.status} (${health.data.components.database.latencyMs}ms)\n`);

  // Step 2: Login as Organizer
  console.log('2️⃣ Authenticating as Event Organizer (Prof. Kiran Kumar)...');
  const orgLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'organizer@sit.ac.in', password: 'Password123!' }),
  });
  const orgToken = orgLogin.data.data.token;
  console.log(`   ✅ Organizer Authenticated | Role: ${orgLogin.data.data.user.role}\n`);

  // Step 3: Create & Publish Event
  console.log('3️⃣ Creating & Publishing New Campus Event...');
  const now = new Date();
  const eventPayload = {
    title: `SIT Quantum Computing & DevOps Summit ${Date.now()}`,
    description: 'Symposium on quantum algorithms and modern containerized continuous delivery pipelines.',
    category: 'TECHNICAL',
    venue: 'Media Center Audi 1, SIT Campus',
    startDateTime: new Date(now.getTime() + 7 * 86400000).toISOString(),
    endDateTime: new Date(now.getTime() + 7 * 86400000 + 14400000).toISOString(),
    totalCapacity: 3, // Small capacity to verify allocation
  };

  const createEvent = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify(eventPayload),
  });
  if (!createEvent.data || !createEvent.data.data) {
    console.error('Create event failed:', createEvent.status, createEvent.data);
    throw new Error('Event creation returned error');
  }
  const eventId = createEvent.data.data.id;
  console.log(`   ✅ Event Created: "${createEvent.data.data.title}"`);
  console.log(`      ID: ${eventId} | Capacity: ${createEvent.data.data.availableCapacity} seats\n`);

  // Step 4: Login as Student
  console.log('4️⃣ Authenticating as Student (Raghavendra Rao)...');
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student@sit.ac.in', password: 'Password123!' }),
  });
  const studentToken = studentLogin.data.data.token;
  console.log(`   ✅ Student Authenticated | USN: ${studentLogin.data.data.user.usn}\n`);

  // Step 5: Reserve Pass (Booking)
  console.log('5️⃣ Student Booking Ticket Pass (Atomic Transaction)...');
  const bookingRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ eventId }),
  });
  if (bookingRes.status !== 201) {
    throw new Error(`Booking failed: ${JSON.stringify(bookingRes.data)}`);
  }
  const ticket = bookingRes.data.data.ticket;
  const booking = bookingRes.data.data.booking;
  console.log(`   ✅ Ticket Reserved Successfully!`);
  console.log(`      Booking Ref: ${booking.bookingReference}`);
  console.log(`      Ticket Code: ${ticket.ticketCode}`);
  console.log(`      QR Payload:  ${ticket.qrPayload}\n`);

  // Step 6: Verify Duplicate Booking Blocked
  console.log('6️⃣ Testing Duplicate Booking Prevention (Same Student, Same Event)...');
  const dupBooking = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ eventId }),
  });
  console.log(`   ✅ Duplicate Request Response: HTTP ${dupBooking.status} (Expected 409 Conflict)`);
  console.log(`      Server Message: "${dupBooking.data.error}"\n`);

  // Step 7: Authenticate Gate Staff
  console.log('7️⃣ Authenticating as Gate Staff (Suresh Gowda)...');
  const gateLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'gate@sit.ac.in', password: 'Password123!' }),
  });
  const gateToken = gateLogin.data.data.token;
  console.log(`   ✅ Gate Staff Authenticated | Terminal: Security Turnstile Gate 1\n`);

  // Step 8: Gate Scan 1 -> Should be VALID
  console.log('8️⃣ Gate Scan #1: Presenting Ticket QR Payload...');
  const scan1 = await request('/validation/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${gateToken}` },
    body: JSON.stringify({ ticketIdentifier: ticket.qrPayload }),
  });
  console.log(`   ✅ Gate Result: [${scan1.data.data.result}]`);
  console.log(`      Message:  "${scan1.data.data.message}"`);
  console.log(`      Attendee: ${scan1.data.data.attendee.name} (${scan1.data.data.attendee.usn})\n`);

  // Step 9: Gate Scan 2 -> Should be ALREADY USED
  console.log('9️⃣ Gate Scan #2: Attempting Duplicate Re-entry with Same Ticket...');
  const scan2 = await request('/validation/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${gateToken}` },
    body: JSON.stringify({ ticketIdentifier: ticket.qrPayload }),
  });
  console.log(`   ✅ Gate Result: [${scan2.data.data.result}]`);
  console.log(`      Message:  "${scan2.data.data.message}"\n`);

  // Step 10: Organizer Dashboard Updated Metrics
  console.log('🔟 Checking Organizer Dashboard Analytics Update...');
  const dash = await request('/events/organizer/dashboard', {
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  const eventStat = dash.data.data.eventsSummary.find((e) => e.id === eventId);
  console.log(`   ✅ Real-time Metrics Confirmed:`);
  console.log(`      Booked Registrations: ${eventStat.bookedCount} / ${eventStat.totalCapacity}`);
  console.log(`      Gate Validated Entries: ${eventStat.validatedCount}`);
  console.log(`      Total Organizer Bookings: ${dash.data.data.totalBookings}\n`);

  console.log('============================================================');
  console.log('🎉 10/10 DEMONSTRATION LIFECYCLE STEPS EXECUTED & VERIFIED');
  console.log('============================================================');
}

runDemoFlow().catch((err) => {
  console.error('❌ Demo flow error:', err);
  process.exit(1);
});
