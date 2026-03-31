export default async function handler(req, res) {
  // ── Get Visitor Data ─────────────────────────────────────
  let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown')
    .split(',')[0].trim();

  const ua = req.headers['user-agent'] || 'Unknown';

  // Simple device / browser detection
  let device = 'Unknown Device';
  if (/Macintosh|Mac OS X/i.test(ua)) device = 'macOS';
  else if (/Windows/i.test(ua)) device = 'Windows';
  else if (/Linux/i.test(ua)) device = 'Linux';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/iPhone|iPad/i.test(ua)) device = 'iOS';

  let browser = 'Unknown Browser';
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/CriOS/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';

  // Live time (UTC – feels live for every visitor)
  const liveTime = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Geolocation (free, no API key)
  let country = 'Unknown';
  let flag = '🌍';
  let city = '';
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city`);
    const data = await geo.json();
    if (data.country) {
      country = data.country;
      city = data.city ? `, ${data.city}` : '';
      // Convert country code to flag emoji
      flag = data.countryCode
        .split('')
        .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
        .join('');
    }
  } catch (e) {}

  // ── Cyberpunk SVG (neon + terminal aesthetic) ───────────
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="320" viewBox="0 0 620 320">
  <defs>
    <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00f0ff"/>
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff00ff"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="620" height="320" fill="#0a0a2a" rx="15"/>
  
  <!-- Header -->
  <text x="310" y="45" text-anchor="middle" fill="#ff00ff" font-family="monospace" font-size="28" font-weight="bold" filter="url(#neon)">CYBERPUNK VISITOR DETECTED</text>
  <text x="310" y="70" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="14" opacity="0.8">TAHMEEDH.GITHUB.IO // LIVE FEED</text>

  <!-- Divider -->
  <line x1="40" y1="90" x2="580" y2="90" stroke="#00f0ff" stroke-width="2" opacity="0.6"/>

  <!-- Data -->
  <text x="40" y="125" fill="#00f0ff" font-family="monospace" font-size="18">IP ADDRESS</text>
  <text x="40" y="155" fill="#ffffff" font-family="monospace" font-size="26" font-weight="bold">${ip}</text>

  <text x="40" y="190" fill="#00f0ff" font-family="monospace" font-size="18">LOCATION</text>
  <text x="40" y="220" fill="#ffffff" font-family="monospace" font-size="26">${flag} ${country}${city}</text>

  <text x="40" y="255" fill="#00f0ff" font-family="monospace" font-size="18">DEVICE / BROWSER</text>
  <text x="40" y="285" fill="#ffffff" font-family="monospace" font-size="24">${device} • ${browser}</text>

  <!-- Live time -->
  <text x="420" y="125" fill="#ff00ff" font-family="monospace" font-size="18" text-anchor="middle">LIVE UTC TIME</text>
  <text x="420" y="160" fill="#00ffff" font-family="monospace" font-size="32" font-weight="bold" text-anchor="middle" filter="url(#neon)">${liveTime}</text>

  <!-- Footer hacker line -->
  <text x="310" y="305" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="13" opacity="0.7">YOU JUST GOT SCANNED 👁️‍🗨️ STAY FROSTY</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(svg);
}