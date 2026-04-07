// -----------------------------------------------------------------------------
// Helper: mask an API key (show first 4 + last 4 chars)
// -----------------------------------------------------------------------------
function maskApiKey(key: string, visibleStart = 4, visibleEnd = 4): string {
    if (!key || key.length <= visibleStart + visibleEnd) return key;
    const start = key.slice(0, visibleStart);
    const end = key.slice(-visibleEnd);
    const middle = '*'.repeat(key.length - visibleStart - visibleEnd);
    return `${start}${middle}${end}`;
}
