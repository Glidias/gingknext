import { curly } from "node-libcurl";

export interface GingkoNode {
	content:string,
	key:string,
	children?:GingkoNode[]
}

let valueKeyCounter = 0;

export async function loadGingkoTree(treeid:string, cleanup:boolean=true) {
  let errorCode = 0;
  let result:GingkoNode[] = [];

  try {
    const curlOpts = {
      httpHeader: ['Content-type: application/json'],
      SSL_VERIFYPEER: 0
    };

    const { statusCode, data, headers } = await curly.get('https://gingkoapp.com/' + treeid + '.json', curlOpts);
    if (!Array.isArray(data)) {
      errorCode |= 1;
    }
    else result = Array.isArray(data) ? data : [];
  } catch(err) {
    // if (IS_DEV) console.log(err);
    errorCode |= 2;
  }
  // to-consider: error report if any
  if (result.length && cleanup) {
    result = cleanupGingkoTree(result);
  }
  return result;
}

export function cleanupGingkoTree(tree:GingkoNode[]):GingkoNode[] {
  valueKeyCounter = 0;
  for (let i = 0, l = tree.length; i < l; i++) {
    setupNode(tree[i]);
    cleanNode(tree[i]);
  }
  return tree;
}

function nodeGotContent(node:GingkoNode):boolean {
  return node.content != "";
}

function cleanNodes(nodes:GingkoNode[]):GingkoNode[] {
  return nodes.filter(nodeGotContent);
}

function setupNode(node:GingkoNode):void {
  node.key =  "_" + (valueKeyCounter++);
}

function cleanNode(node:GingkoNode):void {
  if (!node.children) return;
  if ( node.children.length > 0) {
    node.children = cleanNodes(node.children);
  }
  for (let i = 0, l = node.children.length; i < l; i++) {
    setupNode(node.children[i]);
    cleanNode(node.children[i]);
  }
}