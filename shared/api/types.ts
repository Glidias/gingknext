export interface HostSessionPayload {
  userid: string,
  treeid: string,
  roomkey: string
}
/*
export interface HostSessionResponse {
  roomId: string,
  pin?: string
}
*/

export interface HostCheckPayload {
  userid: string,
  treeid: string,
  roomid: string,
  roomkey: string
}
/*
export interface HostCheckResponse {
  host: boolean
}
*/