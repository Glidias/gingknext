
/**
 * Common Gingko helpers across client/server/both.
 * Exported methods suffixed with `__` are client-side-only and can only run on browser (ie. typically requires DOM).
 * Exported methods suffixed with `_` are server-side-only and can run only on Node.
 * @author Glidias
 */

import { DOMAIN } from '../constants';
import SLLPool, { SLLPoolNode } from '../ds/SLLPool';
import { insertArrayContentsFromIdx } from './common-helpers';

export interface GingkoNode {
	content:string,
  _id:string,
	children?:GingkoNode[]
}

export interface GingkoTreeGroup {
  parent_id: string,
  nodes: GingkoNode[]
}

export interface ColumnsScrollData {
  instant:boolean,
  columns:{
    scrollData:{
      target:string,
      position:"Center"|"After"|"Before"|"Between"
    }
  }[]
}

export function newScrollData(instant:boolean=false, columnGroups:GingkoTreeGroup[][]):ColumnsScrollData {
  return {
    instant,
    columns: columnGroups.map((grps)=> {
      return {
        scrollData: {
          target: grps[0] && grps[0].nodes[0] ? grps[0].nodes[0]._id : '',
          position: 'Center'
        }
      }
    })
  }
}

export function getDocScrnHeight__() {
  let doc = document.getElementById("document");
  return doc ? doc.getBoundingClientRect().height : window.innerHeight;
}

export function newScrollData__(instant:boolean=false, columnGroups:GingkoTreeGroup[][]):ColumnsScrollData {
  let scrnHeight = getDocScrnHeight__();
  return {
    instant,
    columns: columnGroups.map((grps)=> {
      let targetId = grps[0] && grps[0].nodes[0] ? grps[0].nodes[0]._id : '';
      let elemId = 'card-' + targetId;
      let elem = document.getElementById(elemId);
      if (!elem) console.log('newScrollData__:: element not found!! id:'+elemId);
      return {
        scrollData: {
          target: targetId,
          position: (elem ? elem.clientHeight : 0) > scrnHeight ? 'Before' : 'Center'
        }
      }
    })
  }
}

export function updateScrollDataPositions__(colsScrollData:ColumnsScrollData):void {
  let scrnHeight = getDocScrnHeight__();

  for (let i = 0, l = colsScrollData.columns.length; i < l; i++) {
    let grps = colsScrollData.columns[i];
    let elemId = 'card-' + grps.scrollData.target;
    let elem = document.getElementById(elemId);
    if (!elem) console.log('updateScrollDataPositions__:: element not found!! id:'+elemId);
    grps.scrollData.position =  (elem ? elem.clientHeight : 0) > scrnHeight ? 'Before' : 'Center';
  }
}

/**
 * @param colsScrollData  The current scroll column data being used
 * @param cardId  The selected card
 * @param colIndex  The column index belonging to selected card
 */
export function updateScrollDataPositionsFor__(colsScrollData:ColumnsScrollData, cardId: string, colIndex:number):void {
  let scrnHeight = getDocScrnHeight__();
  let count = 0;

  /**
   * all ACTIVE_ANCESTORS column positions must be checked/updated
   * @param cardId Ancestor card id
   */
  function processAnc(cardId:string) {
    count--;
    let curColData = colsScrollData.columns[count].scrollData
    if (curColData.target !== cardId) {
      curColData.target = cardId;
      let elemId = 'card-' + cardId;
      let elem = document.getElementById(elemId);
      if (!elem) console.log('updateScrollDataPositionsFor__:: element not found!! id:'+elemId);
      curColData.position = (elem ? elem.clientHeight : 0) > scrnHeight ? 'Before' : 'Center';
    }
  }
  count = colIndex;
  ACTIVE_ANCESTORS.forEach(processAnc);

  /**
   * all ACTIVE_DESCENDANTS column positions must be checked/updated
   * @param groupId
   */
  function processDesc(groupId:string) {
    if (count === colIndex) {
      count++;
      return;
    }
    count++;
    // let curColData = colsScrollData.columns[count].scrollData
  }
  count = colIndex; // manual index counter
  ACTIVE_DESCENDANTS.forEach(processDesc);

  // assumed always changed: current card position for current column to update
  let curColData = colsScrollData.columns[colIndex].scrollData;
  curColData.target = cardId;
  let elemId = 'card-' + cardId;
  let elem = document.getElementById(elemId);
  if (!elem) console.log('updateScrollDataPositionsFor__:: element not found!! id:'+elemId);
  curColData.position = (elem ? elem.clientHeight : 0) > scrnHeight ? 'Before' : 'Center';
}


/* // importable Gingko v1
export interface GingkoNodeFull extends GingkoNode {
  //"_id": "799a13d49dda2e94db0001b5",
  //"treeId": "799a135f9dda2e94db0001b2",
  //"seq": 10140691,
  //"position": 1,
  //"parentId": "799a136d9dda2e94db0001b4",
  //"deleted": true

  //seq: number,
  //position
}
*/

export type GingkoTree = GingkoNode[];

var valueKeyCounter = 0;

export async function _loadGingkoTree(treeid:string, cleanup:boolean=true):Promise<GingkoTree | null> {
  let errorCode = 0;
  let result:GingkoTree | null = null;
  const { curly } = require("node-libcurl");

  try {
    const curlOpts = {
      httpHeader: ['Content-type: application/json'],
      SSL_VERIFYPEER: 0
    };
    let resultData;
    let isMock = treeid.charAt(0) === "-";
    const { statusCode, data, headers } = await curly.get(
      !isMock ? 'https://gingkoapp.com/' + treeid + '.json'
      : DOMAIN + '/templates/'+treeid.slice(1) + '.json'
    , curlOpts);

    resultData = data;


    if (!Array.isArray(resultData)) {
      errorCode |= 1;
    }
    else result = resultData;
  } catch(err) {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
    errorCode |= 2;
  }
  // to-consider: error report if any
  if (result && result.length && cleanup) {
    result = cleanupGingkoTree(result);
  }
  return result;
}

export function cleanupGingkoTree(tree:GingkoTree):GingkoTree {
  valueKeyCounter = 0;
  tree = tree.filter(nodeGotContent);
  for (let i = 0, l = tree.length; i < l; i++) {
    setupNode(tree[i]);
    cleanNodeChildren(tree[i]);
  }
  return tree;
}

function nodeGotContent(node:GingkoNode):boolean {
  return node.content != "";
}

function setupNode(node:GingkoNode):void {
  if (!node._id) node._id =  "_" + (valueKeyCounter++);
}

function cleanNodeChildren(node:GingkoNode):void {
  if (!node.children) return;
  if ( node.children.length > 0) {
    node.children = node.children.filter(nodeGotContent);
  }
  for (let i = 0, l = node.children.length; i < l; i++) {
    setupNode(node.children[i]);
    cleanNodeChildren(node.children[i]);
  }
}


// -- https://github.com/gingko/client/blob/95a3461d0648f21da49ab5c63b1a0365a3e9256a/src/elm/Doc/TreeUtils.elm

// getChildren~, getDescendants, getColumns!, getParent, getAncestors  ,

const poolGTG: SLLPool<GingkoTreeGroup> = new SLLPool<GingkoTreeGroup>();
function poolGTG_get(nodes, parent_id) {
  let res = poolGTG.get();
  if (res !== null) {
    res.v = {nodes, parent_id}
    return res;
  }
  else return poolGTG.createNodeOf({nodes, parent_id});
}

const stackGNodes: GingkoNode[] = [];

export const ACTIVE_DESCENDANTS:Set<string> = new Set();
/**
 * Modifies global state of active descendants, setting up groups ids in ascending column index order
 * @param fromId The selected card's id
 * @param group The group assosiated with the selected card from columnGroups
 * @return {ACTIVE_DESCENDANTS} Set of descendant group ids (ie. cardIds with children) under a given node 'fromId' including current group id for selected card fromId
 */
export function getDescendantGrpIds (fromId: string, group:GingkoTreeGroup):Set<string> {
  const descendents = ACTIVE_DESCENDANTS;
  descendents.clear();

  function findNode(n) {
    return n._id === fromId;
  }

  let node = group.nodes.find(findNode);

  if (!node) {
    console.error("getDescendants:: group does not contain fromId parameter:" + fromId + " : group:"+group.parent_id)
    return descendents;
  }
  if (!node || !node.children || !node.children.length) return descendents;

  descendents.add(fromId);

  let stack:GingkoNode[] = stackGNodes;
  let si = insertArrayContentsFromIdx(stack, node.children, 0);

  while (--si >= 0) {
    let n = stack[si];
    if (!n) continue;

    if (n.children && n.children.length) {
      descendents.add(n._id);
      si = insertArrayContentsFromIdx(stack, n.children, si);
    }
  }
  return descendents;
}

export const ACTIVE_ANCESTORS:Set<string> = new Set();
/**
 * Modifies global state of active ancestors, setting up card ids in descending column index order
 * @param fromId  The selected card's id
 * @param group The group assosiated with the selected card from columnGroups
 * @param columnGroups The reference to the saved column groups
 * @param colIdx The column index assosiated with the selected card from columnGroups
 * @return {ACTIVE_ANCESTORS} Set of group parent_ids that are ancestors to a given node 'fromId'
 */
export function getAncestors(fromId: string,  group:GingkoTreeGroup, columnGroups:GingkoTreeGroup[][], colIdx:number):Set<string> {
  const ancestors = ACTIVE_ANCESTORS;
  ancestors.clear();

  let anc:GingkoNode | undefined;
  let curId = fromId;

  while(--colIdx >= 0) {
    let colGroupFound = columnGroups[colIdx].find((g)=> {
      return anc = g.nodes.find((n)=>{
        return n.children && n.children.length && n.children.find(c => c._id === curId);
      });
    });
    if (colGroupFound && anc) {
      curId = anc._id;
      ancestors.add(curId);
    } else break;
  }
  console.log(ancestors);
  return ancestors;
}

/**
 *
 * @param tree
 * @returns Array of columns consisting of 1 or more groups per column
 */
export function getColumnGroups(tree:GingkoTree):GingkoTreeGroup[][] {
  let groups:GingkoTreeGroup[][] = [[]];
  let head = poolGTG_get(tree, '');

  let curNode:SLLPoolNode<GingkoTreeGroup> | null = head;
  let tail:SLLPoolNode<GingkoTreeGroup> = head;

  let tarIndex = 0;

  let cueId:string | null = null; // contains Id to indicate next upcoming

  for(curNode = head; curNode !== null; curNode = curNode.next) {
    let q = curNode.v;
    if (!q) continue;
    curNode.v = null; // process once

    if (cueId === q.parent_id) {
      groups[++tarIndex] = [];
      cueId = null;
    }
    groups[tarIndex].push(q);

    let processed = cueId !== null;
    for (let i = 0, l = q.nodes.length; i < l; i++) {
      let n = q.nodes[i];
      if (n.children && n.children.length) {
        if (!processed) {
          cueId = n._id;
          processed = true;
        }
        let res = poolGTG_get(n.children, n._id);
        tail.next = res;
        tail = res;
      }
    }
  }

  tail.next = poolGTG.pool;
  poolGTG.pool = head;
  return groups;
}
/**
 *
 * @param tree
 * @returns Array of columns consisting of flattened list of items per column
 */
export function getColumns(tree:GingkoTree):GingkoNode[][] {
  let columns:GingkoNode[][] = [];
  // push root level =1 of tree
  columns.push(tree);
  // push level >c(=1) of tree
  let curLevelTree:GingkoNode[] = tree;
  while (curLevelTree.length > 0) {
    let collector:GingkoNode[] = [];
    curLevelTree.forEach((n)=> {
      if (n.children && n.children.length) {
        collector.push(...n.children);
      }
    });
    if (collector.length) columns.push(collector);
    curLevelTree = collector;
  }
  return columns;
}

// old reference implementations to test

/*
//console.log(JSON.stringify(getColumnGroups(tree))=== JSON.stringify(getColumnGroups2(tree)));
//console.log(JSON.stringify(getColumnGroups(tree))=== JSON.stringify(getColumnGroups2(tree)));
//console.log(JSON.stringify(getColumnGroups(tree))=== JSON.stringify(getColumnGroups2(tree)));

// array-based shift queue for BFS
 export function getColumnGroups2(tree:GingkoTree):GingkoTreeGroup[][] {
  let groups:GingkoTreeGroup[][] = [[]];
  let queue:GingkoTreeGroup[] = [{nodes:tree, parent_id:''}];
  let tarIndex = 0;

  let cueId:string | null = null; // contains Id to indicate next upcoming
  while(queue.length) {
    let q = queue.shift();
    if (!q) continue;

    if (cueId === q.parent_id) {
      groups[++tarIndex] = [];
      cueId = null;
    }
    groups[tarIndex].push(q);

    let processed = cueId !== null;
    q.nodes.forEach((n)=>{
      if (n.children && n.children.length) {
        if (!processed) {
          cueId = n._id;
          processed = true;
        }
        queue.push({nodes:n.children, parent_id: n._id});
      } // else add dummy group?
    });
  }
  return groups;
}
*/