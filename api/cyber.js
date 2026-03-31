import UAParser from 'ua-parser-js';

export default async function handler(req, res) {
  let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown')
    .split(',')[0].trim();

  const uaString = req.headers['user-agent'] || '';
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  // Clean device name
  let device = result.device.model 
    ? `${result.device.vendor || ''} ${result.device.model}`.trim() 
    : result.os.name || 'Unknown Device';

  if (device === 'Unknown Device' && result.device.type) {
    device = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1);
  }

  let browser = `${result.browser.name || 'Unknown Browser'} ${result.browser.version ? result.browser.version.split('.')[0] : ''}`.trim();

  // GitHub crawler fallback
  if (uaString.includes('GitHub') || uaString.length < 30) {
    device = 'GitHub Preview';
    browser = '🤖 Bot';
  }

  // ── Live Time ─────────────────────────────────────
  const liveTime = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // ── Geo (unchanged) ─────────────────────────────────────
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

  // ── SVG (same beautiful design) ─────────────────────────────────────
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="355" viewBox="0 0 640 355">
  <defs>
    <filter id="neonpink" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#ff00ff"/>
    </filter>
    <filter id="neoncyan" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#00f0ff"/>
    </filter>
  </defs>
  <rect width="640" height="355" fill="#0a0a1f" rx="20"/>
  
  <text x="320" y="50" text-anchor="middle" fill="#ff00ff" font-family="monospace" font-size="31" font-weight="bold" filter="url(#neonpink)">CYBERPUNK VISITOR DETECTED</text>
  <text x="320" y="75" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="14.5">TAHMEEDH.GITHUB.IO // LIVE FEED</text>

  <line x1="40" y1="100" x2="600" y2="100" stroke="#00f0ff" stroke-width="3" opacity="0.7"/>

  <text x="40" y="135" fill="#00f0ff" font-family="monospace" font-size="18">IP ADDRESS</text>
  <text x="40" y="168" fill="#ffffff" font-family="monospace" font-size="28" font-weight="bold" filter="url(#neoncyan)">${ip}</text>

  <text x="40" y="205" fill="#00f0ff" font-family="monospace" font-size="18">LOCATION</text>
  <text x="40" y="237" fill="#ffffff" font-family="monospace" font-size="26">${flag} ${country}${city}</text>

  <text x="40" y="270" fill="#00f0ff" font-family="monospace" font-size="18">DEVICE / BROWSER</text>
  <text x="40" y="302" fill="#ffffff" font-family="monospace" font-size="24.5">${device} • ${browser}</text>

  <text x="460" y="135" fill="#ff00ff" font-family="monospace" font-size="18" text-anchor="middle">LIVE UTC TIME</text>
  <text x="460" y="175" fill="#00ffff" font-family="monospace" font-size="35" font-weight="bold" text-anchor="middle" filter="url(#neoncyan)">${liveTime}</text>

  <text x="320" y="340" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="13.5" opacity="0.8">YOU JUST GOT SCANNED 👁️‍🗨️ STAY FROSTY</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(svg);
}