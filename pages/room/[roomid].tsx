import { RoomServiceProvider } from "@roomservice/react";
import RoomViewer from "../../components/room-viewer";
import { useUserID } from "../../shared/util/mockuser";
import { useRouter } from 'next/router'

async function myAuthFunction(params: {
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

export default function Room() {
  const router = useRouter();
  const { roomid } = router.query;
  const userID = useUserID();
  return (
    <RoomServiceProvider
    //  Don't connect until the userID is set
    online={userID !== null}
    clientParameters={{
      auth: myAuthFunction,
      ctx: {
        userID,
      },
    }}
   >
      <RoomViewer roomid={roomid ? roomid + '' : ''}></RoomViewer>
    </RoomServiceProvider>
  );
}
