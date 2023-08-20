export const ContextEventKey = "__BAKERY_INTERNAL__request_context";
export const ContextChangedKey = "__BAKERY_INTERNAL__context_changed";
export const SetContextEventKey = "__BAKERY_INTERNAL__set_context";

export class RequestContextEvent extends Event {
  readonly #data: Record<string | symbol, unknown> = {};

  constructor() {
    super(ContextEventKey, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
  }

  AddData(key: string | symbol, data: unknown) {
    if (this.#data[key]) return;

    this.#data[key] = data;
  }

  get Data() {
    return this.#data;
  }
}

export class SetContextEvent extends Event {
  readonly #data: unknown;
  readonly #key: string | symbol;

  constructor(key: string | symbol, data: unknown) {
    super(SetContextEventKey, {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    this.#key = key;
    this.#data = data;
  }

  get Key() {
    return this.#key;
  }

  get Data() {
    return this.#data;
  }
}

export class ContextChangedEvent extends Event {
  constructor() {
    super(ContextChangedKey, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
  }
}
