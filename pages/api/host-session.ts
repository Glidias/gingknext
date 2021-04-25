
import { NextApiRequest, NextApiResponse } from "next";
//import { HostSessionResponse } from "../../shared/api/types";

import { getRoomIdFromDetails, newRoomDetails, RoomDetails } from "../../shared/util/room";
const apiKey = process.env.ROOMSERVICE_API_KEY;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let errCode = 0;
  if (!apiKey) {
    errCode = -1;
    return res.json({error: errCode})
  }

  const {userid, roomkey, treeid} = req.query;
  if (!userid) {
    errCode |= 1;
  }
  if (!roomkey) {
    errCode |= 2;
  }
  if (!treeid) {
    errCode |= 4;
  }

  if (errCode) {
    return res.json({error: errCode})
  }

  const sessionPin:string | undefined = req.query.pin !== undefined ? (Math.floor(Math.random() * 90000) + 10000).toString() : undefined;
  const roomDetails:RoomDetails = newRoomDetails(userid.toString(), roomkey.toString(), treeid.toString());
  const roomId = getRoomIdFromDetails(roomDetails);
  if (sessionPin) {
    const createClient = require("@roomservice/node");
    const rs = createClient(apiKey ? apiKey : '');
    const checkpoint = await rs.checkpoint("lobby");
    const map = checkpoint.map("sessionPins");
    map.set('' + sessionPin, roomId);
    await checkpoint.save(map);
  }
  res.json({
    pin: sessionPin,
    roomId
  });
};