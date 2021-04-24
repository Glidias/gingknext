import { useMap, useRoom, useList} from "@roomservice/react";
import Doc from "./Doc";
import { FunctionComponent, useEffect, useState } from 'react'
import { GingkoTree } from "../shared/util/gingko";
import { LS_KEYS } from "../shared/constants";
import { hostSessionCheck } from "../shared/api/host-check";

/**
 * Component to handle wrap document for online collaboration/hosting session
 */
const RoomViewer: FunctionComponent<{
  readonly roomid: string,
  readonly treeid: string,
  readonly treedata: GingkoTree | null
}> =
({roomid, treeid, treedata}) => {

  if (roomid && treeid) {
    const room = useRoom(roomid);
    const [host, hostMap] = useMap<{cardId: string}>(roomid, 'hostMap');
    const [isHost, setIsHost] = useState(false);
    // validate local computer has host access via api see if it matches roomid
    useEffect(() => {
      if (!hostMap) return;
      let userid = 'glenn'; // localStorage.getItem(LS_KEYS.userId) ||
      let roomkey = '123'; //localStorage.getItem(LS_KEYS.roomKey) ||;

      (async () => {
        const hc = await hostSessionCheck ({roomid:roomid+'', roomkey, userid, treeid});
        setIsHost(hc.host);
        hostMap.set('cardId', ''); // todo: initially saved cardId from LS
      })();
    }, [hostMap]);


    const doHostSelectCard = (cardId) => {
      hostMap?.set('cardId', cardId);
    };

    /*
    useEffect(() => {
      if (!room) return;
    }, [room]);
    */

    return (
    <div>
      {
      room && treedata ?
        <Doc tree={treedata} hostCardId={host.cardId} hostCallback={isHost ? doHostSelectCard : undefined}></Doc>
      :
        <div>
          Loading room data..
        </div>
      }
    </div>
    );
  }
  else {
    return <div>Room not found.</div>;
  }

}
export default RoomViewer;