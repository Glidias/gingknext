import { useMap, useRoom, useList} from "@roomservice/react";
import { useEffect } from "react";
import Doc from "./Doc";
import { FunctionComponent } from 'react'
import { GingkoTree } from "../shared/util/gingko";

const RoomViewer: FunctionComponent<{
  readonly roomid: string,
  readonly treeid: string,
  readonly treedata: GingkoTree | null
}> =
({roomid, treeid, treedata}) => {

  if (roomid && treeid) {
    const room = useRoom(roomid);

    // Initzzz...
    /*
    const [form, testMap] = useMap<{ ab: string; cc: string }>(
      "myroom",
      "myform"
    );
    useEffect(()=> {
      if (!testMap) return;
      console.log('a');
      // testMap?.set('ab', 'xxxxxx');
      setInterval(()=>{
        testMap?.set('ab', ''+Math.random()+'xxx');
      },1000);
    }, [testMap]);

    useEffect(() => {
      if (!room) return;
    }, [room]);
    */

    return (
    <div>
      {
      room && treedata ?
        <Doc tree={treedata}></Doc>
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