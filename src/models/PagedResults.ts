import Pager from "./Pager";

export default class PagedResults<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevPage: number | undefined | null;
  nextPage: number | undefined | null;
  lastPage: number;
  beforePages: number[];
  afterPages: number[];

  constructor(params: {
    items: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
  }) {
    this.items = params.items;
    this.totalItems = params.totalItems;
    this.currentPage = params.currentPage;
    this.pageSize = params.pageSize;
    this.lastPage = Math.ceil(params.totalItems / params.pageSize);

    this.prevPage = this.currentPage > 1 ? this.currentPage - 1 : 1;
    this.nextPage = this.currentPage < this.lastPage ? this.currentPage + 1 : this.currentPage;
    this.hasPrev = this.currentPage > 1;
    this.hasNext = this.currentPage < this.lastPage;

    this.beforePages = [];
    for (let i = this.currentPage - 2; i < this.currentPage; i++) {
      if (i >= 1 && i <= this.currentPage) this.beforePages.push(i);
    }
    this.afterPages = [];
    for (let i = this.currentPage + 1; i <= this.currentPage + 2; i++) {
      if (i <= this.lastPage && i >= this.currentPage) this.afterPages.push(i);
    }
  }

  getPager(): Pager {
    return new Pager({
      totalItems: this.totalItems,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      afterPages: this.afterPages,
      beforePages: this.beforePages,
      lastPage: this.lastPage,
      prevPage: this.prevPage,
      nextPage: this.nextPage,
      hasPrev: this.hasPrev,
      hasNext: this.hasNext,
    });
  }
}