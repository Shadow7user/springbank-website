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
(function () {
  var grid = document.getElementById("statsGrid");
  if (!grid) return;

  fetch("/api/stats")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !Array.isArray(d.stats) || d.stats.length === 0) return;
      grid.innerHTML = d.stats.map(function (s) {
        return '<div class="stat"><div class="stat__number">' + s.value + '</div><div class="stat__label">' + s.label + '</div></div>';
      }).join("");
    })
    .catch(function () {
      // Keep static fallback values in markup.
    });
})();
`;

const statusWidgetScript = `
(function () {
  var tapCount = 0;
  var resetTimer = null;

  function resolveStatusText(data) {
    var status = data && data.system && data.system.status ? data.system.status : "unknown";
    var database = data && data.system && data.system.database ? data.system.database : "unknown";

    if (status === "maintenance") {
      return "MAINTENANCE MODE | DB: " + database.toUpperCase();
    }
    if (status === "operational") {
      return "ALL SYSTEMS GO | DB: " + database.toUpperCase();
    }
    return "SYSTEM STATUS UNKNOWN";
  }

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest(".site-logo, .logo, h1, [aria-label=\\"Home\\"], [aria-label*=\\"Home\\"]")
      : null;
    if (!target) return;

    tapCount += 1;
    if (resetTimer) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      tapCount = 0;
      resetTimer = null;
    }, 800);

    if (tapCount !== 3) return;
    tapCount = 0;

    var statusDiv = document.getElementById("sysStatus");
    if (!statusDiv) return;

    fetch("/api/stats")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        statusDiv.textContent = resolveStatusText(data);
        statusDiv.style.display = "block";
        window.setTimeout(function () {
          statusDiv.style.display = "none";
        }, 5000);
      })
      .catch(function () {
        statusDiv.textContent = "SYSTEM STATUS UNKNOWN";
        statusDiv.style.display = "block";
        window.setTimeout(function () {
          statusDiv.style.display = "none";
        }, 5000);
      });
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
