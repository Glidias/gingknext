
import URI from 'urijs';

 // TODO: strict typing api call and response
export async function callGetAPI<T>(path:string, params: T) {
  const response = await fetch(new URI("/api/"+ path).addSearch(params).toString(), {
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
    data: body
  }
}
