export function cleanInput(input: string): string {
    return input
        .replace(/&gt;/, '>')
        .replace(/&lt;/, '<')
        .replace(/&amp;/, '&')
        .replace(/&nbsp;/, ' ')
        .replace(/&quot;/, '"')
        .replace(/<br>/, '\n')
}
