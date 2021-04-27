
import URI from 'urijs';
import {ApiGetFilenames} from '../api/types';

/**
 * Generic Api get call with <T> payload and response <R>
 * @param path
 * @param params the T payload
 * @return The response R
 */
export async function callGetAPI<T, R>(path:ApiGetFilenames, params: T):Promise<R> {
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
  return body;
}
