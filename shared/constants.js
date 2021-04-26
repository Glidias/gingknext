/** The http(s) site url */
export const DOMAIN = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.VERCEL_URL + '';

/** HTML attribute flag to unlink rel="alternate" anchor links via same domain check */
export const ATTR_DOMAIN_SLICE = 'data-domain-slice';

/** Local storage keys */
export const LS_KEYS = {
  userId: 'roomservice-user',
  roomKey: 'roomKey'
}
if (typeof window !== 'undefined') {
  Object.freeze(LS_KEYS);
}