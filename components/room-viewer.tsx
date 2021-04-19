import { useMap, useRoom, useList} from "@roomservice/react";
import { useEffect } from "react";
import Doc from "./doc";
import React, { FunctionComponent } from 'react'

const RoomViewer: FunctionComponent<{readonly roomid: string}> = ({roomid}) => {
  if (roomid) {
    const room = null;// useRoom('myroom');
    const [form, testMap] = useMap<{ ab: string; cc: string }>(
      "myroom",
      "myform"
    );
    useEffect(()=> {
      // testMap?.set('ab', 'xxxxxx');
      setInterval(()=>{
       // testMap?.set('ab', ''+Math.random()+'xxx');
      },1000);
    }, [testMap])

    const [rooms, list] = useList('myroom', 'lobbyRoomListx');

    //list.push('vbb');
    //list.push('bb');
    //list.push('aa');

    useEffect(()=> {
      setTimeout(()=>{
        list?.push('bb');
      },1000);
    }, [list]);


    const [mapData, map] = useMap<{ hostFocusCardId: string | undefined | null, treeId: string | undefined }>(
      roomid,
      "roomData"
    );
      // treeId from local storage or WAIT..+

      useEffect(() => {
        if (!room) return;
        // const map = room.map("roomData")

        // if got save roomId:treeId in localstraoge, set treeId from local storage?
        //map.set('treeId', 'afafw');

      }, [room]);

      useEffect(() => {
        console.log("room's treeId loaded!"+mapData.treeId);

      }, [mapData.treeId]);

    return (
    <div>
      {
      mapData.treeId ?
        <Doc></Doc>
      :
        <div>
          Loading room data... {form.ab} {rooms.length}
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