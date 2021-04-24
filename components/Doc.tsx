import { FunctionComponent, SyntheticEvent, useEffect, useState } from "react";
import { GingkoTree, getColumnGroups, getDescendantGrpIds, getAncestors,
  ACTIVE_ANCESTORS, ACTIVE_DESCENDANTS, GingkoTreeGroup } from "../shared/util/gingko";
import DocCard from "./DocCard";
if (typeof window !== 'undefined') {
  var {scrollHorizontal} = require('../shared/util/doc-helpers');
}
interface DocProps {
  readonly tree: GingkoTree,
  readonly hostCardId?: string
}

var LAST_TREE_COLUMNS:GingkoTreeGroup[][] = [];
var LAST_TREE:GingkoTree;

const Doc: FunctionComponent<DocProps> = ({tree, hostCardId}) => {

  const columnGroups = LAST_TREE !== tree ? getColumnGroups(tree) : LAST_TREE_COLUMNS;
  LAST_TREE_COLUMNS = columnGroups;
  LAST_TREE = tree;

  const usingHost = hostCardId !== undefined;

  /*
  group.has-active
  group active-descendant
  card ancestor
  card active
  */
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(-2);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(-2);

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
    let group = columnGroups[colIdx][groupIdx];

    setSelectedCardId(cardId);
    setSelectedColumn(colIdx);
    setSelectedGroupIdx(groupIdx);

    getDescendantGrpIds(cardId, group);
    getAncestors(cardId, group, columnGroups, colIdx);
  }

  useEffect(() => {
    let cardId = selectedCardId;
    if (cardId) { // !hostCardId &&  (unless host lock?)
      if (selectedColumn >= 0) scrollHorizontal(selectedColumn, false);
    }
  }, [selectedCardId])

  return (
  <div id="document">
    <div className="left-padding-column" />
    <div id="column-container">
      {
      columnGroups.map((groups, colIndex) =>
      <div className="column" key={colIndex} id={`ginkcolumn-${colIndex}`} data-idx={colIndex}>
        <div className="buffer" />
          { groups.map((g, grpIndex) =>
          <div key={g.parent_id}
            className={`group${grpIndex === selectedGroupIdx && colIndex === selectedColumn ? ' has-active' : ''}${ACTIVE_DESCENDANTS.has(g.parent_id) ? ' active-descendant' : ''}`}
            data-idx={grpIndex} onClick={clickGroupHandler}>
            { g.nodes.map((n) =>
            <DocCard key={n._id}
              node={n}
              activatedVector={usingHost && hostCardId === n._id ? 2 : selectedCardId === n._id ? 1 : ACTIVE_ANCESTORS.has(n._id) ? -1 : 0 }
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
