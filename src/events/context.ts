export const ContextEventKey = "__BAKERY_INTERNAL__request_context";
export const ContextChangedKey = "__BAKERY_INTERNAL__context_changed";

export class RequestContextEvent extends Event {
  readonly #data: Record<string, unknown> = {};

  constructor() {
    super(ContextEventKey, { bubbles: true, cancelable: false });
  }

  AddData(key: string, data: unknown) {
    if (this.#data[key]) return;

    this.#data[key] = data;
  }

  get Data() {
    return this.#data;
  }
}

export class ContextChangedEvent extends Event {
  constructor() {
    super(ContextChangedKey, { bubbles: true, cancelable: false });
  }
}
