import { RoomServiceProvider } from "@roomservice/react";
import RoomViewer from "../../components/RoomViewer";
import { useUserID } from "../../shared/util/mockuser";
import { useRouter } from 'next/router'
import { getDetailsFromRoomId, getRoomIdFromDetails, getTreeIdFromRoomDetails } from "../../shared/util/room";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { FunctionComponent } from "react";
import { GingkoTree, loadGingkoTree } from "../../shared/util/gingko";

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

interface RoomProps {
  roomId: string,
  treeId: string, // blank string for invalid treeId
  treeData: GingkoTree | null
};

export async function getServerSideProps(context:GetServerSidePropsContext):Promise<GetServerSidePropsResult<RoomProps>> {
  const roomid = context.query.roomid ? ''+context.query.roomid : '';
  let roomDetails = getDetailsFromRoomId(roomid +'');
  let treeId = '';
  if (roomDetails) {
    treeId = getTreeIdFromRoomDetails(roomDetails);
  }
  let treeData:GingkoTree | null = null;
  if (treeId) {
    let result = await loadGingkoTree(treeId);
    if (result && result.length !== 0) {
      treeData = result;
    } else {
      if (!result) {
        treeId = '';
      }
    }
  }
  return {
    props: {
      roomId: roomid,
      treeId,
      treeData
    }
  };
}

const Room: FunctionComponent<RoomProps> = (props) => {
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
      <RoomViewer treedata={props.treeData} treeid={props.treeId} roomid={roomid ? roomid + '' : ''}></RoomViewer>
    </RoomServiceProvider>
  );
};
export default Room;
