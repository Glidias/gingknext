
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Doc from "../components/Doc";
import DocHeader from "../components/DocHeader";
import { HostSessionPayload } from "../shared/api/types";
import { callGetAPI } from "../shared/util/api-helper";
import { GingkoNode, _loadGingkoTree } from "../shared/util/gingko";
import { getRoomHostingKey, getUserID } from "../shared/util/mockuser";

interface TreeProps {
  tree: GingkoNode[] | null,
  treeid: string
}

export async function getServerSideProps(context:GetServerSidePropsContext):Promise<GetServerSidePropsResult<TreeProps>> {
  const treeid = context.query.treeid ? ''+context.query.treeid : '';
  let result = await _loadGingkoTree(treeid);
  return {
    props: {
      tree: result,
      treeid
    }
  };
}

export default function TreeDoc<Function>(props:TreeProps) {

  const router = useRouter();
  const minimalView = router.query.emb !== undefined; // temp for now '?app' for viewing .

  async function onRoomServiceClick(e) {
    const roomkey = getRoomHostingKey();
    const userid = getUserID();
    const result = await callGetAPI<HostSessionPayload>('host-session', {roomkey, userid, treeid: props.treeid});
    if (result.data && result.data.roomId) {
      router.push("/room/" + result.data.roomId);
    }
  }

  return (
    props.tree ?
    [
    <Doc key="doc" tree={props.tree}></Doc>,
    !minimalView ?
      <DocHeader key="header" showIcon={true}>
        <div id="roomservice-icon" className="header-button" onClick={onRoomServiceClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M2 17h20v2H2zm11.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z"/></svg>
        </div>
      </DocHeader>
      : null
    ]
    :
    <div>
      <Head>
        <link rel="stylesheet" href="/home.css"/>
      </Head>
      Failed to find tree: {props.treeid}
    </div>
  );
}