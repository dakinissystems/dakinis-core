const HEADER_NAMES = /^(authorization|cookie|set-cookie|x-api-key)$/i;
const FIELD_NAMES = /password|token|secret|authorization|cookie|code|state/i;
const QUERY = /([?&](?:code|state|password|token|refreshToken|refresh_token)=)[^&]*/gi;

function scrubString(value) {
  return value.replace(QUERY, "$1redacted");
}

export function scrubSentryValue(value) {
  if (typeof value === "string") return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubSentryValue);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (HEADER_NAMES.test(key) || FIELD_NAMES.test(key)) {
      out[key] = "[redacted]";
    } else {
      out[key] = scrubSentryValue(item);
    }
  }
  return out;
}

export function scrubSentryEvent(event) {
  if (event.request) {
    event.request = scrubSentryValue(event.request);
    delete event.request.cookies;
  }
  if (event.extra) event.extra = scrubSentryValue(event.extra);
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((crumb) =>
      crumb?.data ? { ...crumb, data: scrubSentryValue(crumb.data) } : crumb
    );
  }
  return event;
}
