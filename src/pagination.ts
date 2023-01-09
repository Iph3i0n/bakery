export default class PaginationEvent extends Event {
  readonly #skip: number;
  readonly #take: number;

  static get Key() {
    return "pagination";
  }

  constructor(skip: number, take: number) {
    super(PaginationEvent.Key, { bubbles: true });
    this.#skip = skip;
    this.#take = take;
  }

  get Skip() {
    return this.#skip;
  }

  get Take() {
    return this.#take;
  }
}
