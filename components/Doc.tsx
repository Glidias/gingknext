import { Fragment, FunctionComponent, useEffect, useMemo, useState } from "react";
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

    // Doesn't happen now because typically (cardId == null) due to CSS/HTML and event handler location at group
    if (cardId === selectedCardId) {
      // scroll back again if under viewing ?
      // scrollToCardId(cardId);
      return;
    }

    const remoteTrigger = !(e.nativeEvent instanceof MouseEvent);
    if (remoteTrigger) {
      e.nativeEvent.stopPropagation();
      // if (hostCallback) return; // for single host, assumed host has already triggered stuff locally on his local computer and doesn't need to reset data
    }
    else if (hostCallback) {
      hostCallback(cardId);
      return; // for multiple host switching support? (not optimized render call cycles+1), Not part of feature plan but useful for multiple same desktop windows syncing.
    }

    let groupElem:HTMLElement = e.currentTarget;
    let colElem = groupElem.parentElement;

    let colIdx = colElem ? parseInt(colElem.getAttribute('data-idx') || '-1') : -2;
    let groupIdx = groupElem ? parseInt(groupElem.getAttribute('data-idx') || '-1') : -2;
    let group = columnGroups[colIdx][groupIdx];

    if (colIdx < 0 || groupIdx < 0) {
      console.error("clickGroupHandler:: Clicked card should have group assosiated! with it")
    }

    setSelectedCardId(cardId);
    setSelectedColumn(colIdx);
    setSelectedGroupIdx(groupIdx);

    getDescendantGrpIds(cardId, group);

    getAncestors(cardId, columnGroups, colIdx);
  }

  function returnBackToHostHandler(e) {
    let elem = document.getElementById('card-'+hostCardId);
    elem?.dispatchEvent( new Event('click', {bubbles: true}));
  }

  // https://github.com/gingko/client/blob/e15ffdee2f99672f08f6bfe5f2f00310822e9129/src/shared/doc.js#L453  // ScrollCards:
  function scrollToCardId(cardId) {
    if (selectedColumn >= 0) scrollHorizontal(selectedColumn, false);
    if (scrollData) {
      let selectedGroup = columnGroups[selectedColumn] && columnGroups[selectedColumn][selectedGroupIdx] !== undefined ? columnGroups[selectedColumn][selectedGroupIdx] : null;
      if (selectedGroup === null) {
        console.error("scrollToCardId:: Should have a group selected! [col,grp] " + [selectedColumn, selectedGroupIdx])
      }
      updateScrollDataPositionsFor__(scrollData, cardId, selectedColumn, selectedGroup, columnGroups)
      scrollColumns(scrollData);
    }
  }

  useEffect(() => {
    let cardId = selectedCardId;
    if (cardId) {
      scrollToCardId(cardId)
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
    <Fragment>
      {
  usingHost ? <div onClick={returnBackToHostHandler} key="returnBtn" className={'back-to-host-btn' + (hostCardId && hostCardId !== selectedCardId ? ' diff-host' : '')}></div>
    : null
    }
  <div key="document" id="document" className={usingHost && hostCardId !== selectedCardId ? 'diff-host' : ''}>
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
  </Fragment>
  );
}

export default Doc;

/*
group.has-active
group active-descendant
card ancestor
card active
*/
