export default class Pager {
  lastPage: number = 1;
  currentPage: number = 1;
  prevPage: number = 1;
  nextPage: number = 1;
  pageSize: number = 10;
  hasPrev: boolean = false;
  hasNext: boolean = false;
  beforePages: number[] = [];
  afterPages: number[] = [];
  totalItems: number = 0;

  constructor(data: Partial<Pager> = {}) {
    Object.assign(this, data);
  }
}