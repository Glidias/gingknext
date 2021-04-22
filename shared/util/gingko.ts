import { DOMAIN } from '../constants';

export interface GingkoNode {
	content:string,
  _id:string,
	children?:GingkoNode[]
}

/* // exportable?
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
      : DOMAIN + '/mockdata/'+treeid.slice(1) + '.json'
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
