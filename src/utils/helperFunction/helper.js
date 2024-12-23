function getDeviceType(userAgent) {
  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  if (isTablet) {
    return "Tablet";
  } else if (isMobile) {
    return "Mobile";
  } else if (isDesktop) {
    return "Desktop";
  } else {
    return "Unknown";
  }
}

function getOperatingSystem(userAgent) {
  if (/Windows NT 10.0/.test(userAgent)) return "Windows 10";
  if (/Windows NT 6.1/.test(userAgent)) return "Windows 7";
  if (/Mac OS X/.test(userAgent)) return "macOS";
  if (/Linux/.test(userAgent)) return "Linux";
  if (/Android/.test(userAgent)) return "Android";
  if (/iPhone|iPad/.test(userAgent)) return "iOS";
  if (/Chrome OS/.test(userAgent)) return "Chrome OS";
  return "Unknown OS";
}
module.exports = { getDeviceType, getOperatingSystem };
