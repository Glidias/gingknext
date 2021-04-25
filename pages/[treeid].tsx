
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Doc from "../components/Doc";
import { GingkoNode, _loadGingkoTree } from "../shared/util/gingko";

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
  return (
    props.tree ?
    <Doc tree={props.tree}></Doc>
    :
    <div>
      Failed to find tree: {props.treeid}
    </div>
  );
}