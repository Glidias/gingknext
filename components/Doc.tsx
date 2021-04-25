import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { GingkoTree, getColumnGroups, getDescendantGrpIds, getAncestors,
  ACTIVE_ANCESTORS, ACTIVE_DESCENDANTS, newScrollData, updateScrollDataPositions__, updateScrollDataPositionsFor__ } from "../shared/util/gingko";
import DocCard from "./DocCard";
if (typeof window !== 'undefined') {
  var {scrollHorizontal, scrollColumns} = require('../shared/util/doc-helpers');
}
interface DocProps {
  readonly tree: GingkoTree,
  readonly hostCardId?: string,
  readonly hostCallback?: (string)=>void;
}

const Doc: FunctionComponent<DocProps> = ({tree, hostCardId, hostCallback}) => {

  const columnGroups = useMemo(()=>getColumnGroups(tree), [tree]);

  const usingHost = hostCardId !== undefined;

  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(-2);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(-2);

  // Initialize default scrolling data for new document
  const scrollData = useMemo(()=>{
    // consider: true for instant for initial start?
    // consider: save scrollData in local storage to maintain scroll upon refresh?
    return newScrollData(false, columnGroups);
  }, []); // tree ? may need a versioning parameter eg. treeDoc.version for: {tree:GingkoTree, version:number}

  useEffect(()=>{
    if (scrollData) updateScrollDataPositions__(scrollData);
  }, [scrollData]);

  // Capture clicking of cards under group (event bubbled)
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
      if (hostCallback) return; // for single host, assumed host has already triggered stuff locally on his local computer and doesn't need to reset data
    }
    else if (hostCallback) {
      hostCallback(cardId);
      // return; // for multiple host switching support? (not optimized render call+1), but Not part of feature plan.
    }

    let groupElem:HTMLElement = e.currentTarget;
    let colElem = groupElem.parentElement;

    let colIdx = colElem ? parseInt(colElem.getAttribute('data-idx') || '-1') : -2;
    let groupIdx = groupElem ? parseInt(groupElem.getAttribute('data-idx') || '-1') : -2;
    let group = columnGroups[colIdx][groupIdx];

    setSelectedCardId(cardId);
    setSelectedColumn(colIdx);
    setSelectedGroupIdx(groupIdx);

    let setIds = getDescendantGrpIds(cardId, group);

    setIds = getAncestors(cardId, group, columnGroups, colIdx);
  }

  useEffect(() => {
    let cardId = selectedCardId;
    if (cardId) { // !hostCardId &&  (unless host lock?)
      // https://github.com/gingko/client/blob/e15ffdee2f99672f08f6bfe5f2f00310822e9129/src/shared/doc.js#L453  // ScrollCards:
      if (selectedColumn >= 0) scrollHorizontal(selectedColumn, false);
      if (scrollData) {
        updateScrollDataPositionsFor__(scrollData, cardId, selectedColumn)
        scrollColumns(scrollData);
      }
    }
  }, [selectedCardId]);

  useEffect(()=> {
    if (!hostCardId) return;
    let elem = document.getElementById('card-'+hostCardId);
    if (elem) {
      elem.dispatchEvent(new Event('click', {bubbles: true}));
    }
  }, [hostCardId]);

  // console.log(selectedCardId, selectedGroupIdx, selectedColumn);

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
