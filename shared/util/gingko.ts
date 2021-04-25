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

export async function loadGingkoTree(treeid:string, cleanup:boolean=true):Promise<GingkoTree | null> {
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
 *
 * @param fromId
 * @param group
 * @return {ACTIVE_DESCENDANTS} Set of descendant group ids (ie. cardIds with children) under a given node 'fromId'
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
 *
 * @param fromId
 * @param group
 * @param columnGroups
 * @param colIdx
 * @return {ACTIVE_ANCESTORS} Set of card ids that are ancestors to a given node 'fromId'
 */
export function getAncestors(fromId: string,  group:GingkoTreeGroup, columnGroups:GingkoTreeGroup[][], colIdx:number):Set<string> {
  const ancestors = ACTIVE_ANCESTORS;
  ancestors.clear();

  let anc:GingkoNode | undefined;
  let curId = fromId;

  function findMatchesCurId(c) {
    return c._id === curId;
  }
  function findGroup(g) {
    return anc = g.nodes.find(findMatchesCurId);
  }
  function findNode(n) {
    return n.children && n.children.length && n.children.find(findGroup);
  }

  while(--colIdx >= 0) {
    let colGroupFound = columnGroups[colIdx].find(findNode);
    if (colGroupFound && anc) {
      curId = anc._id;
      ancestors.add(curId);
    } else break;
  }
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