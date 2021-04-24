const rabbit = require('rabbit-cipher');
const hashSecret = process.env.HASH_SECRET;
const RABBIT_DIGEST = 'hex';

export type RoomDetails = [
	userid: string,
	roomkey: string,
	treeid: string
]
const IDX_userid = 0;
const IDX_roomkey = 1;
const IDX_treeid = 2;
const TOTAL_IDX = 3;

// ----------

function getRoomStrFromDetails(details:RoomDetails) {
  return details.join('|');
}
function getDetailsFromRoomStr(roomStr:string):RoomDetails | null {
  let roomSpl = roomStr.split('|');
  // @ts-ignore
  return roomSpl.length === TOTAL_IDX ? roomSpl : null;
}
export function getRoomIdFromDetails(details:RoomDetails):string {
  let result = rabbit.encSync(getRoomStrFromDetails(details), hashSecret, RABBIT_DIGEST);
  return result;
}
export function getDetailsFromRoomId(roomId:string, hostDetails:{userid:String, roomkey:string, treeid:string}|null=null):RoomDetails | null {
  let str: string;
  try {
    str =  rabbit.decSync(roomId, hashSecret, RABBIT_DIGEST);
  } catch(err) {
    console.log("could not parse");
    return null;
  }

  let roomDetails = getDetailsFromRoomStr(str);
  if (roomDetails === null) return null;
  if (hostDetails === null) {
    return newRoomDetails('', '', roomDetails[IDX_treeid]);
  }
  console.log('verifying host details', hostDetails);
  return roomDetails[IDX_userid] === hostDetails.userid
   && roomDetails[IDX_roomkey] === hostDetails.roomkey
   && roomDetails[IDX_treeid] === hostDetails.treeid ?
    roomDetails : null;
}

export function newRoomDetails(userid:string, roomkey:string, treeid:string):RoomDetails {
  return [userid, roomkey, treeid];
}

export function getTreeIdFromRoomDetails(details:RoomDetails) {
  return details[IDX_treeid];
}


