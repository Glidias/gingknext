
import URI from 'urijs';

// HOST SIDE CALLS

export interface HostSessionPayload {
  roomkey: string,
  userid: string,
  treeid: string,
  roomid: string
}

export async function hostSessionCheck(params: HostSessionPayload) {
  const response = await fetch(new URI("/api/host-check").addSearch(params).toString(), {
    method: "GET",
    headers: {
    "Content-Type": "application/json",
    },
  });
  if (response.status === 401) {
    throw new Error("Unauthorized!");
  }

  if (response.status !== 200) {
    throw await response.text();
  }

  const body = await response.json();
  return {
    host: !!body.host
  };
}
