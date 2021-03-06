
import { NextApiRequest, NextApiResponse } from "next";
import { APIResult, HostCheckResponse } from "../../shared/api/types";
import { getDetailsFromRoomId } from "../../shared/util/room";

export default async (req: NextApiRequest, res: NextApiResponse<APIResult<HostCheckResponse>>) => {
  let errCode = 0;

  const {userid, roomkey, treeid, roomid} = req.query;
  if (!userid) {
    errCode |= 1;
  }
  if (!roomkey) {
    errCode |= 2;
  }
  if (!treeid) {
    errCode |= 4;
  }
  if (!roomid) {
    errCode |= 8;
  }

  if (errCode) {
    return res.json({error: errCode})
  }

  res.json({
    data: {
      host: !!getDetailsFromRoomId(roomid+'', {userid:userid+'', roomkey:roomkey+'', treeid:treeid+''})
    }
  });
};
