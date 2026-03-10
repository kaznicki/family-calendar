export function getTokenFromURL(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') ?? ''
}
