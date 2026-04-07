import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spring Bank Demo",
  description: "SpringBank full-stack demo foundation"
};

const systemStatusStyle: React.CSSProperties = {
  position: "fixed",
  right: "10px",
  bottom: "10px",
  zIndex: 9999,
  display: "none",
  padding: "2px 6px",
  borderRadius: "12px",
  background: "#000",
  color: "#0f0",
  fontSize: "10px",
  opacity: 0.7
};

const statsScript = `
(function() {
  fetch('/api/stats')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d || !d.stats || d.stats.length === 0) return;
      var grid = document.getElementById('statsGrid');
      if (!grid) return;
      grid.innerHTML = d.stats.map(function(s) {
        return '<div class="stat"><div class="stat__number">' + s.value + '</div><div class="stat__label">' + s.label + '</div></div>';
      }).join('');
    })
    .catch(function() { /* keep static fallback */ });
})();
`;

const statusWidgetScript = `
(function() {
  var tapCount = 0;
  var logo = document.querySelector('h1, .logo, [aria-label="Home"]');
  if (!logo) return;
  logo.addEventListener('click', function() {
    tapCount++;
    setTimeout(function() { tapCount = 0; }, 800);
    if (tapCount === 3) {
      var statusDiv = document.getElementById('sysStatus');
      if (statusDiv) {
        fetch('/api/stats')
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(data) {
            var status = (data && data.system && data.system.status) ? data.system.status : 'unknown';
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = status === 'maintenance' ? '🔧 Maintenance mode' : '✅ All systems go';
            setTimeout(function() { statusDiv.style.display = 'none'; }, 5000);
          })
          .catch(function() { statusDiv.innerHTML = '⚠️ Status unknown'; });
      }
    }
  });
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en">
      <body>
        {children}
        <div id="sysStatus" style={systemStatusStyle} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: statsScript }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: statusWidgetScript }} />
      </body>
    </html>
  );
}
