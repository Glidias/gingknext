import { FunctionComponent } from "react"
import { GingkoNode } from "../shared/util/gingko";
import DocCardView from "./DocCardView"

interface DocCardProps {
  node: GingkoNode,

  /**  Positive value indicates active state,  negative value indicates ancestor state */
  activatedVector: number
}

const DocCard: FunctionComponent<DocCardProps> = ({node, activatedVector}) => {
return <div
	id={`card-${node._id}`}
  dir="auto"
  data-cardid={node._id}
	className={`card${node.children && node.children.length ? ' has-children' : ''}${activatedVector !== 0 ? activatedVector > 0 ? ' active' : ' ancestor' : ''}`}
	draggable="true"
>
  <DocCardView content={node.content}></DocCardView>
</div>
};

export default DocCard;