import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { GingkoTree, getColumnGroups, getDescendantGrpIds, getAncestors,
  ACTIVE_ANCESTORS, ACTIVE_DESCENDANTS, GingkoTreeGroup } from "../shared/util/gingko";
import DocCard from "./DocCard";
if (typeof window !== 'undefined') {
  var {scrollHorizontal} = require('../shared/util/doc-helpers');
}
interface DocProps {
  readonly tree: GingkoTree,
  readonly hostCardId?: string,
  readonly hostCallback?: (string)=>void;
}

const Doc: FunctionComponent<DocProps> = ({tree, hostCardId, hostCallback}) => {

  const columnGroups = useMemo(()=>getColumnGroups(tree), [tree])

  const usingHost = hostCardId !== undefined;

  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(-2);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(-2);

  function clickGroupHandler(e) {
    let targElem:HTMLElement = e.target;
    let cardId = targElem.getAttribute('data-cardid');
    if (cardId === null) {
      return;
    }
    if (cardId === selectedCardId) {
      // scroll back again if under viewing
      return;
    }
    const remoteTrigger = !(e.nativeEvent instanceof MouseEvent);
    if (remoteTrigger) {
      e.nativeEvent.stopPropagation();
      if (hostCallback) return;
    }
    else if (hostCallback) {
      hostCallback(cardId);
    }

    let groupElem:HTMLElement = e.currentTarget;
    let colElem = groupElem.parentElement;

    let colIdx = colElem ? parseInt(colElem.getAttribute('data-idx') || '-1') : -2;
    let groupIdx = groupElem ? parseInt(groupElem.getAttribute('data-idx') || '-1') : -2;
    let group = columnGroups[colIdx][groupIdx];

    // console.log(remoteTrigger, cardId, colIdx, groupIdx);

    setSelectedCardId(cardId);
    setSelectedColumn(colIdx);
    setSelectedGroupIdx(groupIdx);

    getDescendantGrpIds(cardId, group);
    getAncestors(cardId, group, columnGroups, colIdx);
  }

  // https://github.com/gingko/client/blob/e15ffdee2f99672f08f6bfe5f2f00310822e9129/src/shared/doc.js#L453  // ScrollCards:
  useEffect(() => {
    let cardId = selectedCardId;
    if (cardId) { // !hostCardId &&  (unless host lock?)

      if (selectedColumn >= 0) scrollHorizontal(selectedColumn, false);
    }
  }, [selectedCardId]);

  useEffect(()=> {
    if (!hostCardId) return;
    let elem = document.getElementById('card-'+hostCardId);
    if (elem) {
      elem.dispatchEvent(new Event('click', {bubbles: true}));
    }
  }, [hostCardId]);

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

/*
group.has-active
group active-descendant
card ancestor
card active
*/
