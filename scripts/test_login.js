let fetchFn;
try {
  // Node >= 18 tiene fetch global
  fetchFn = global.fetch || undefined;
} catch {
  fetchFn = undefined;
}

if (!fetchFn) {
  fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

const fetch = fetchFn;

const [,, emailArg, passwordArg] = process.argv;
const email = emailArg || 'diddec@ucn.cl';
const password = passwordArg || 'Test123!';

(async () => {
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('HTTP', res.status);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})(); 