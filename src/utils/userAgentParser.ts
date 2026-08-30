/**
 * Utility for parsing and formatting Client/Device User Agent strings into human-readable details.
 */

export interface ParsedClientInfo {
  os: string;
  browser: string;
  deviceType: "mobile" | "tablet" | "desktop";
  shortLabel: string; // Compact label for tables: e.g. "Chrome • Android", "Safari • iOS"
  fullLabel: string;  // Detailed label: e.g. "Google Chrome pada Android 14 (Samsung Galaxy)"
}

export function parseClientUserAgent(ua?: string): ParsedClientInfo {
  if (!ua || ua === "Unknown") {
    return {
      os: "Perangkat Klien",
      browser: "Web Browser",
      deviceType: "mobile",
      shortLabel: "Web Client",
      fullLabel: "Perangkat Klien Web",
    };
  }

  // 1. Detect Operating System & Model
  let os = "Desktop";
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";

  if (/iPhone/i.test(ua)) {
    os = "iOS (iPhone)";
    deviceType = "mobile";
  } else if (/iPad/i.test(ua)) {
    os = "iPadOS (iPad)";
    deviceType = "tablet";
  } else if (/Android/i.test(ua)) {
    deviceType = "mobile";
    const androidMatch = ua.match(/Android\s+([\d.]+)/i);
    const androidVer = androidMatch ? `Android ${androidMatch[1]}` : "Android";

    if (/SM-[A-Z0-9]+|Samsung/i.test(ua)) {
      os = `${androidVer} (Samsung)`;
    } else if (/Redmi|POCO|Xiaomi|2[0-9]{6}[A-Z]+/i.test(ua)) {
      os = `${androidVer} (Xiaomi)`;
    } else if (/CPH[0-9]+|Oppo/i.test(ua)) {
      os = `${androidVer} (Oppo)`;
    } else if (/V2[0-9]+|Vivo/i.test(ua)) {
      os = `${androidVer} (Vivo)`;
    } else if (/Pixel\s+[0-9a-z]+/i.test(ua)) {
      os = `${androidVer} (Pixel)`;
    } else if (/Realme|RMX[0-9]+/i.test(ua)) {
      os = `${androidVer} (Realme)`;
    } else {
      os = androidVer;
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS";
    deviceType = "desktop";
  } else if (/Windows/i.test(ua)) {
    const winMatch = ua.match(/Windows NT ([\d.]+)/i);
    const winVer = winMatch && winMatch[1] === "10.0" ? "Windows 10/11" : "Windows";
    os = winVer;
    deviceType = "desktop";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
    deviceType = "desktop";
  }

  // 2. Detect Web Browser & Client
  let browser = "Web Browser";
  if (/SamsungBrowser/i.test(ua)) {
    const vMatch = ua.match(/SamsungBrowser\/([\d.]+)/i);
    browser = vMatch ? `Samsung Internet v${vMatch[1].split(".")[0]}` : "Samsung Internet";
  } else if (/Edg\/|Edge\//i.test(ua)) {
    const vMatch = ua.match(/Edg\/([\d.]+)/i);
    browser = vMatch ? `Edge v${vMatch[1].split(".")[0]}` : "Microsoft Edge";
  } else if (/Chrome\/|CriOS\//i.test(ua) && !/Edg/i.test(ua) && !/SamsungBrowser/i.test(ua)) {
    const vMatch = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/i);
    browser = vMatch ? `Chrome v${vMatch[1].split(".")[0]}` : "Google Chrome";
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
    const vMatch = ua.match(/Version\/([\d.]+)/i);
    browser = vMatch ? `Safari v${vMatch[1].split(".")[0]}` : "Apple Safari";
  } else if (/Firefox|FxiOS/i.test(ua)) {
    const vMatch = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/i);
    browser = vMatch ? `Firefox v${vMatch[1].split(".")[0]}` : "Mozilla Firefox";
  } else if (/Opera|OPR/i.test(ua)) {
    browser = "Opera";
  }

  const shortOs = os.replace(" (iPhone)", "").replace(" (iPad)", "");
  const shortLabel = `${browser} • ${shortOs}`;
  const fullLabel = `${browser} pada ${os}`;

  return {
    os,
    browser,
    deviceType,
    shortLabel,
    fullLabel,
  };
}
