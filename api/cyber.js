import UAParser from 'ua-parser-js';

export default async function handler(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown')
    .split(',')[0].trim();

  const uaString = req.headers['user-agent'] || '';

  let device = 'Unknown Device';
  let browser = 'Unknown Browser';

  // ── Only trigger for real GitHub Camo proxy ─────────────────────
  const isGitHubCamo = uaString.includes('camo') || 
                       uaString.includes('GitHub') || 
                       /bot|crawler|spider|preview/i.test(uaString);

  if (isGitHubCamo) {
    device = 'GITHUB RENDER';
    browser = '🤖 LIVE SCAN ACTIVE';
  } 
  else {
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    if (result.device.model) device = `${result.device.vendor || ''} ${result.device.model}`.trim();
    else if (result.device.type) device = result.device.type === 'mobile' ? 'Mobile' : result.device.type === 'tablet' ? 'Tablet' : 'Desktop';
    else if (result.os.name) device = result.os.name;

    if (result.browser.name) {
      browser = result.browser.name;
      if (result.browser.version) browser += ` ${result.browser.version.split('.')[0]}`;
    }
  }

  // Live Time + Geo (unchanged)
  const liveTime = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  let country = 'Unknown', flag = '🌍', city = '';
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city`);
    const data = await geo.json();
    if (data.country) {
      country = data.country;
      city = data.city ? `, ${data.city}` : '';
      flag = data.countryCode.split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
    }
  } catch (e) {}

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="660" height="360" viewBox="0 0 660 360">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#113212"/>
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00f0ff"/>
    </filter>
  </defs>
  <rect width="660" height="360" fill="#0a0a1f" rx="20"/>
  
  <text x="330" y="52" text-anchor="middle" fill="#113212" font-family="monospace" font-size="32" font-weight="bold" filter="url(#glow)">CYBERPUNK VISITOR DETECTED</text>
  <text x="330" y="78" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="15">TAHMEEDH.GITHUB.IO // LIVE FEED</text>
  
  <line x1="40" y1="105" x2="620" y2="105" stroke="#00f0ff" stroke-width="3" opacity="0.8"/>

  <text x="45" y="140" fill="#00f0ff" font-family="monospace" font-size="18">IP ADDRESS</text>
  <text x="45" y="173" fill="#fff" font-family="monospace" font-size="29" font-weight="bold">${ip}</text>

  <text x="45" y="210" fill="#00f0ff" font-family="monospace" font-size="18">LOCATION</text>
  <text x="45" y="243" fill="#fff" font-family="monospace" font-size="27">${flag} ${country}${city}</text>

  <text x="45" y="275" fill="#00f0ff" font-family="monospace" font-size="18">DEVICE / BROWSER</text>
  <text x="45" y="308" fill="#fff" font-family="monospace" font-size="25">${device} • ${browser}</text>

  <text x="480" y="140" fill="#113212" font-family="monospace" font-size="18" text-anchor="middle">LIVE UTC TIME</text>
  <text x="480" y="180" fill="#00ffff" font-family="monospace" font-size="36" font-weight="bold" text-anchor="middle">${liveTime}</text>

  <text x="330" y="348" text-anchor="middle" fill="#00f0ff" font-family="monospace" font-size="14" opacity="0.8">YOU JUST GOT SCANNED 👁️‍🗨️ STAY FROSTY</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.send(svg);
}