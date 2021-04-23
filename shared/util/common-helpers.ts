/**
 * @param arr Target array
 * @param src Source array
 * @return Same target array for chaining
 */
export function pushArrayWith<T>(arr:T[], src: T[]):T[] {
  let a = arr.length;
  for (let i = 0, l = src.length; i < l; i++) {
    arr[a++] = src[i];
  }
  return arr;
}

/**
 * @param arr Target array
 * @param src Source array
 * @return Final length of target array after pushing contents of source array => (fromIndex + src.length)
 */
export function insertArrayContentsFromIdx<T>(arr:T[], src: T[], fromIndex:number):number {
  let a = fromIndex;
  for (let i = 0, l = src.length; i < l; i++) {
    arr[a++] = src[i];
  }
  return a;
}