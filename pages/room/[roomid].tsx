import { RoomServiceProvider } from "@roomservice/react";
import RoomViewer from "../../components/RoomViewer";
import { useUserID } from "../../shared/util/mockuser";
import { useRouter } from 'next/router'
import { getDetailsFromRoomId, getRoomIdFromDetails, getTreeIdFromRoomDetails } from "../../shared/util/room";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { FunctionComponent, useEffect } from "react";
import { GingkoTree, loadGingkoTree } from "../../shared/util/gingko";
import { roomAuthFunction } from "../../shared/util/roomservice";

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
  const { roomid, nohost } = router.query;
  const userID = useUserID();

  return (
    <RoomServiceProvider
    //  Don't connect until the userID is set
    online={userID !== null}
    clientParameters={{
      auth: roomAuthFunction,
      ctx: {
        userID,
      },
    }}
   >
      <RoomViewer enforceNoHost={nohost!==undefined} treedata={props.treeData} treeid={props.treeId} roomid={roomid ? roomid + '' : ''}></RoomViewer>
    </RoomServiceProvider>
  );
};
export default Room;
