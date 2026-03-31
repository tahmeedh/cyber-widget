export default async function handler(req, res) {
  let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown')
    .split(',')[0].trim();

  const ua = req.headers['user-agent'] || '';

  // ── Improved Device Detection ─────────────────────────────────
  let device = 'Unknown Device';
  if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/Windows/i.test(ua)) device = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'macOS';
  else if (/Linux/i.test(ua) && !/Android/i.test(ua)) device = 'Linux';

  // ── Improved Browser Detection ───────────────────────────────
  let browser = 'Unknown Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/CriOS|Chrome|Edg/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
  else if (/Brave/i.test(ua)) browser = 'Brave';

  // Fallback for mobile + version if possible
  if (device === 'iOS' && browser === 'Unknown Browser') browser = 'Safari';

  // ── Live Time & Geo (kept from before) ───────────────────────
  const liveTime = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  let country = 'Unknown';
  let flag = '🌍';
  let city = '';
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city`);
    const data = await geoRes.json();
    if (data.country) {
      country = data.country;
      city = data.city ? `, ${data.city}` : '';
      flag = data.countryCode
        .split('')
        .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
        .join('');
    }
  } catch (e) {}

  // ── Updated SVG with better styling & glow ───────────────────
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="340" viewBox="0 0 620 340">
  <defs>
    <filter id="neonpink" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#ff00ff"/>
    </filter>
    <filter id="neoncyan" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00f0ff"/>
    </filter>
  </defs>
  <rect width="620" height="340" fill="#0a0a1f" rx="20"/>
  
  <text x="310" y="48" text-anchor="middle" fill="#ff00ff" font-family="monospace" font-size="29" font-weight="bold" filter="url(#neonpink)">CYBERPUNK VISITOR DETECTED</text>
  <text x="310" y="72" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="14">TAHMEEDH.GITHUB.IO // LIVE FEED</text>

  <line x1="40" y1="95" x2="580" y2="95" stroke="#00f0ff" stroke-width="2.5" opacity="0.7"/>

  <text x="40" y="130" fill="#00f0ff" font-family="monospace" font-size="18">IP ADDRESS</text>
  <text x="40" y="162" fill="#ffffff" font-family="monospace" font-size="27" font-weight="bold" filter="url(#neoncyan)">${ip}</text>

  <text x="40" y="200" fill="#00f0ff" font-family="monospace" font-size="18">LOCATION</text>
  <text x="40" y="232" fill="#ffffff" font-family="monospace" font-size="26">${flag} ${country}${city}</text>

  <text x="40" y="265" fill="#00f0ff" font-family="monospace" font-size="18">DEVICE / BROWSER</text>
  <text x="40" y="297" fill="#ffffff" font-family="monospace" font-size="24">${device} • ${browser}</text>

  <text x="430" y="130" fill="#ff00ff" font-family="monospace" font-size="18" text-anchor="middle">LIVE UTC TIME</text>
  <text x="430" y="170" fill="#00ffff" font-family="monospace" font-size="34" font-weight="bold" text-anchor="middle" filter="url(#neoncyan)">${liveTime}</text>

  <text x="310" y="325" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="13" opacity="0.75">YOU JUST GOT SCANNED 👁️‍🗨️ STAY FROSTY</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(svg);
}