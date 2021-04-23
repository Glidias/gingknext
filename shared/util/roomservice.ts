export async function roomAuthFunction(params: {
	room: string;
	ctx: { userID: number };
  }) {
	const response = await fetch("/api/roomservice", {
	  method: "POST",
	  headers: {
		"Content-Type": "application/json",
	  },
	  //  Pass cookies to server
	  credentials: "include",
	  body: JSON.stringify({
		room: params.room,

		//  TODO: Determine userID on server based on cookies or values passed in here.
		user: params.ctx.userID,
	  }),
	});

	if (response.status === 401) {
	  throw new Error("Unauthorized!");
	}

	if (response.status !== 200) {
	  throw await response.text();
	}

	const body = await response.json();
	return {
	  user: body.user,
	  resources: body.resources,
	  token: body.token,
	};
  }