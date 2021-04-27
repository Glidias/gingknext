import { useMap, useRoom, useList} from "@roomservice/react";
import Doc from "./Doc";
import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { GingkoTree } from "../shared/util/gingko";
import { LS_KEYS } from "../shared/constants";
import Head from "next/head";
import { callGetAPI } from "../shared/util/api-helper";
import { APIResult, HostCheckPayload, HostCheckResponse } from "../shared/api/types";

/**
 * Component to handle wrap document for online collaboration/hosting session
 */
const RoomViewer: FunctionComponent<{
  readonly roomid: string,
  readonly treeid: string,
  readonly treedata: GingkoTree | null,
  /** Enforce no host to always simulate client, specifically for local machine */
  readonly enforceNoHost?: boolean
}> =
({roomid, treeid, treedata, enforceNoHost}) => {

  if (roomid && treeid) {
    const room = useRoom(roomid);
    const [host, hostMap] = useMap<{cardId: string}>(roomid, 'hostMap');
    const [isHost, setIsHost] = useState(false);
    // validate local computer has host access via api see if it matches roomid
    if (!enforceNoHost) {
      useEffect(() => {
        if (!hostMap) return;

        /* To test dummy room
        // /room/68a50d5830e1409aa4fd8db83dae82bc6aa962b0481d7895adea39a8221869d602
        let userid = 'glenn'; // localStorage.getItem(LS_KEYS.userId) || '';
        let roomkey = '123'; //localStorage.getItem(LS_KEYS.roomKey) || '';
        */

        ///*
        let userid = localStorage.getItem(LS_KEYS.userId);
        let roomkey = localStorage.getItem(LS_KEYS.roomKey);
        //*/

        if (roomkey && userid) {
          (async () => {
            const hc = await callGetAPI<HostCheckPayload, APIResult<HostCheckResponse>>('host-check', {roomid, roomkey, userid, treeid});
            if (hc.data) {
              setIsHost(hc.data.host);
              hostMap.set('cardId', ''); // todo: initially saved cardId from LS
            } else {
              console.error("HostCheckResponse failed: " + hc.error);
            }
          })();
        }
      }, [hostMap]);
    }

    const doHostSelectCard = useCallback((cardId) => {
      hostMap?.set('cardId', cardId);
    }, [hostMap]);

    return (
      room && treedata ?
        <Doc tree={treedata} hostCardId={host.cardId} hostCallback={isHost ? doHostSelectCard : undefined}></Doc>
      :
        <div>
          Loading room data..
        </div>
    );
  }
  else {
    return <div>
    <Head>
      <link rel="stylesheet" href="/home.css"/>
    </Head>
      Room not found.
    </div>;
  }

}
export default RoomViewer;