import { FunctionComponent } from "react"
import { GingkoNode } from "../shared/util/gingko";
import DocCardView from "./DocCardView"

interface DocCardProps {
  node: GingkoNode,

  /**  Positive value indicates active state,  negative value indicates ancestor state */
  activatedVector: number
}

const DocCard: FunctionComponent<DocCardProps> = ({node, activatedVector}) => {
let activeClassStr = '';
activeClassStr += activatedVector < 0 ? ' ancestor' : '';
activeClassStr += activatedVector > 0 ? ' active' : '';
activeClassStr += activatedVector === 2 ? ' host-active' : '';
return <div
	id={`card-${node._id}`}
  dir="auto"
  data-cardid={node._id}
	className={`card${node.children && node.children.length ? ' has-children' : ''}${activeClassStr}`}
	draggable="true"
>
  <DocCardView content={node.content}></DocCardView>
</div>
};

export default DocCard;