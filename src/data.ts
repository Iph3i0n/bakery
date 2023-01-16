import { IComponent, LoadedEvent, ShouldRender } from "./deps.ts";

class ProviderAddedEvent extends Event {
  constructor() {
    super(ProviderAddedEvent.Key, { bubbles: true });
  }

  static get Key() {
    return "provider-added";
  }
}

class DataChangedEvent extends Event {
  #value: unknown;
  #key: string;

  constructor(key: string, value: unknown) {
    super(DataChangedEvent.Key, { bubbles: false });
    this.#key = key;
    this.#value = value;
  }

  static get Key() {
    return "data-changed";
  }

  get Value() {
    return this.#value;
  }

  get Key() {
    return this.#key;
  }
}

class RequestDataEvent extends Event {
  #key: string;

  constructor(key: string) {
    super(RequestDataEvent.Key, { bubbles: true });
    this.#key = key;
  }

  static get Key() {
    return "data-requested";
  }

  get Key() {
    return this.#key;
  }
}

export class Provider {
  readonly #self: IComponent;
  readonly #key: string;

  #subjects: Array<HTMLElement> = [];
  #data: unknown = undefined;

  readonly #listener = (e: Event) => {
    if (!(e instanceof RequestDataEvent))
      throw new Error(
        "Only RequestDataEvent objects can be used to request data"
      );

    if (e.target === this.#self) return;

    if (e.Key !== this.#key) return;

    const target = e.target;
    if (!(target instanceof HTMLElement))
      throw new Error("Only HTML elements can listen for data");

    e.preventDefault();
    e.stopPropagation();

    this.#add_trigger(target);
  };

  get #triggers() {
    this.#subjects = this.#subjects.filter((s) => s?.isConnected);
    return this.#subjects;
  }

  get #event() {
    return new DataChangedEvent(this.#key, this.#data);
  }

  #add_trigger(target: HTMLElement) {
    if (this.#subjects.some((s) => s === target)) return;
    this.#subjects = [...this.#triggers, target];
    if (this.#data) target.dispatchEvent(this.#event);
  }

  constructor(self: IComponent, key: string) {
    this.#self = self;
    this.#key = key;

    this.#self.addEventListener(RequestDataEvent.Key, this.#listener);
    document.dispatchEvent(new ProviderAddedEvent());
  }

  set data(value: unknown) {
    this.#data = value;
    for (const trigger of this.#triggers) trigger.dispatchEvent(this.#event);
  }

  get data() {
    return this.#data;
  }
}

export abstract class Receiver extends HTMLElement {
  abstract readonly props: Record<string, string>;

  #key = "";
  #filter: (data: unknown) => unknown = (a) => a;

  #data: unknown = undefined;

  accessor = "use";
  fetcher_override: string | undefined = undefined;

  readonly #listener = (e: Event) => {
    if (!(e instanceof DataChangedEvent))
      throw new Error("Change events must come from a DataChangedEvent");
    if (e.Key !== this.#key) return;

    this.#data = this.#filter(e.Value);

    setTimeout(() => {
      this.dispatchEvent(new ShouldRender());
    });
  };

  constructor() {
    super();

    this.addEventListener(LoadedEvent.Key, () => {
      const a = this.fetcher_override ?? this.props[this.accessor];
      if (!a) return;

      const [key] = a.split(/[.\[\(]/, 1);
      const remainder = a.replace(key, "");
      this.#filter = new Function(
        "data",
        "return data" + (remainder ?? "")
      ) as (data: unknown) => unknown;
      this.#key = key;

      this.addEventListener(DataChangedEvent.Key, this.#listener);
      this.dispatchEvent(new RequestDataEvent(key));

      document.addEventListener(ProviderAddedEvent.Key, () =>
        this.dispatchEvent(new RequestDataEvent(key))
      );
    });
  }

  set data(data: unknown) {
    this.#data = data;
    this.dispatchEvent(new ShouldRender());
  }

  get data() {
    if (!this.#data) return undefined;

    return this.#data;
  }
}
