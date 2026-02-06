async function test() {
  // Test sign-out
  console.log("--- Test Sign-Out ---");
  const r = await fetch("http://localhost:3002/api/auth/sign-out", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "http://localhost:3002" },
  });
  console.log("Status:", r.status);
  const t = await r.text();
  console.log("Body:", t);

  // Test sign-in with correct user then sign-out
  console.log("\n--- Test Sign-In then Sign-Out ---");
  const r2 = await fetch("http://localhost:3002/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "http://localhost:3002" },
    body: JSON.stringify({ email: "newtestuser@gmail.com", password: "TestPass123!" }),
  });
  console.log("Sign-In Status:", r2.status);
  const cookies = r2.headers.getSetCookie();
  console.log("Cookies:", cookies);
  const loginBody = await r2.text();
  console.log("Body:", loginBody);

  if (cookies.length > 0) {
    const cookieStr = cookies.map(c => c.split(";")[0]).join("; ");
    console.log("\n--- Sign-Out with cookies ---");
    const r3 = await fetch("http://localhost:3002/api/auth/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3002",
        "Cookie": cookieStr,
      },
    });
    console.log("Sign-Out Status:", r3.status);
    console.log("Body:", await r3.text());
  }
}
test();
