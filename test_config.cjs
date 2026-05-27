const fs = require('fs');

async function test() {
  try {
    // We don't know the admin email and password.
    // BUT we know the frontend can fetch it. Let's just create a test company, and then fetch its config from the public endpoint!
    // But wait, what company names exist? "Mi Empresa", "Acme Chile", "Innova"?
    const names = ["Mi Empresa", "Acme Chile", "Acme", "Prueba", "Innova"];
    
    for (const name of names) {
      const res = await fetch(`http://localhost:8080/api/v1/public/companies/${encodeURIComponent(name)}/config`);
      if (res.ok) {
        const data = await res.json();
        console.log(`\nFound company: ${name}`);
        console.log(JSON.stringify(data.config, null, 2));
      }
    }
  } catch(e) {
    console.error(e);
  }
}
test();
