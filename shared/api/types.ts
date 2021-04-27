
// Any helper/auto-generator for this:: list file paths/names in api directory?
export type ApiGetFilenames =
'host-check' | 'host-session';

export type APIResult<T> = {
  error?: number,
  data?:T
};

/* ----------------- */

export interface HostSessionPayload {
  userid: string,
  treeid: string,
  roomkey: string
}

export interface HostSessionResponse {
  roomId: string,
  pin?: string
}


export interface HostCheckPayload {
  userid: string,
  treeid: string,
  roomid: string,
  roomkey: string
}

export interface HostCheckResponse {
  host: boolean
}