export interface SLLPoolNode<T> {
  v:T | null,
  next: SLLPoolNode<T> | null
}

export default class SLLPool<T> {
  pool:SLLPoolNode<T> | null;

  create(newHandler:()=>T):SLLPoolNode<T> {
    if (this.pool) {
      let res = this.pool;
      this.pool = this.pool.next;
      res.next = null;
      return res;
    } else {
      return {
        v: newHandler(),
        next: null
      };
    }
  }

  createNodeOf(v:T):SLLPoolNode<T> {
    return {
      v,
      next: null
    }
  }

  get():SLLPoolNode<T> | null {
    if (this.pool) {
      let res = this.pool;
      this.pool = this.pool.next;
      res.next = null;
      return res;
    } else {
      return null; // factory
    }
  }

  recycleList(head, tail) {
    tail.next = this.pool;
    this.pool = head;
  }
}