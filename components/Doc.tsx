import { FunctionComponent } from "react";
import { GingkoTree, getColumnGroups } from "../shared/util/gingko";

interface DocProps {
  readonly tree: GingkoTree,
}

const Doc: FunctionComponent<DocProps> = ({tree}) => {

/*
group active-descendant
card ancestor
*/

const columnGroups = getColumnGroups(tree);
return (
<div id="document">
  <div className="left-padding-column" />
  <div id="column-container">
    {
    columnGroups.map((groups, i) =>
    <div className="column" key={i}>
      <div className="buffer" />
        { groups.map((g) =>
          <div className="group" key={g.parent_id}>
            { g.nodes.map((n) =>
            <div
              key={n._id}
              id={`card-${n._id}`}
              dir="auto"
              className="card"
              draggable="true"
            >
              <div className="view">
                <div>
                  {n.content}
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      <div className="buffer" />
    </div>
    )
    }
  </div>
  <div className="right-padding-column" />
</div>
);
}

export default Doc;
