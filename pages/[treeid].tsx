
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Doc from "../components/doc";
import { GingkoNode, loadGingkoTree } from "./util/gingko";

interface TreeProps {
  tree: GingkoNode[],
  treeid: string
}

export async function getServerSideProps(context:GetServerSidePropsContext):Promise<GetServerSidePropsResult<TreeProps>> {
  const treeid = context.query.treeid ? ''+context.query.treeid : '';
  let result = await loadGingkoTree(treeid);
  return {
    props: {
      tree: result,
      treeid
    }
  };
}

export default function TreeDoc(props) {
  // console.log(props.tree);
  return (
    <Doc></Doc>
  );
}