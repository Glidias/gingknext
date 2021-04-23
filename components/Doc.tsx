import { FunctionComponent, useState } from "react";
import { GingkoTree, getColumnGroups, getDescendantGrpIds } from "../shared/util/gingko";
import DocCard from "./DocCard";

interface DocProps {
  readonly tree: GingkoTree,
}

const Doc: FunctionComponent<DocProps> = ({tree}) => {

/*
group active-descendant
card ancestor
card active
*/
const columnGroups = getColumnGroups(tree);


function clickGroupHandler(e) {
  let targElem:HTMLElement = e.target;
  let cardId = targElem.getAttribute('data-cardid');
  if (cardId === null) {
    return;
  }
  let groupElem:HTMLElement = e.currentTarget;
  let colElem = groupElem.parentElement;


  let colIdx = colElem ? parseInt(colElem.getAttribute('data-idx') || '-1') : -2;
  let groupIdx = groupElem ? parseInt(groupElem.getAttribute('data-idx') || '-1') : -2;
  // alert(colIdx + " :" + groupIdx +  " :: "+cardId);
  let group = columnGroups[colIdx][groupIdx];
  let descs = getDescendantGrpIds(cardId, group);
  console.log(descs);
}


return (
<div id="document">
  <div className="left-padding-column" />
  <div id="column-container">
    {
    columnGroups.map((groups, i) =>
    <div className="column" key={i} id={`ginkcolumn-${i}`} data-idx={i}>
      <div className="buffer" />
        { groups.map((g, i) =>
        <div className="group" key={g.parent_id}  data-idx={i} onClick={clickGroupHandler}>
          { g.nodes.map((n) =>
          <DocCard key={n._id}
            node={n}
            activatedVector={0}
          />
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
