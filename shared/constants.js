export const DOMAIN = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.VERCEL_URL + '';

// local storage keys
export const LS_KEYS = {
  userId: 'roomservice-user',
  roomKey: 'roomKey'
}
if (typeof window !== 'undefined') {
  Object.freeze(LS_KEYS);
}