const DEFAULT_REDIRECT_PATH = "/account";

export function getSafeRedirectPath(
  value: string | string[] | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH,
) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return fallback;
  }

  if (
    !rawValue.startsWith("/") ||
    rawValue.startsWith("//") ||
    rawValue.includes("\\")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(rawValue, "http://finds.local");

    if (parsed.origin !== "http://finds.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
