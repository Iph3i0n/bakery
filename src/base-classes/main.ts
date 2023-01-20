import { IComponent, ShouldRender } from "../deps.ts";
import {
  ContextChangedEvent,
  ContextChangedKey,
  ContextEventKey,
  RequestContextEvent,
} from "../events/context.ts";

// deno-lint-ignore no-explicit-any
type Context = Record<string, any>;

export default abstract class BakeryBase
  extends HTMLElement
  implements IComponent
{
  abstract readonly props: Record<string, string>;
  abstract readonly internals: ElementInternals;
  abstract readonly root: ShadowRoot;

  constructor() {
    super();
  }

  #get_value(fetcher: (ctx: Context) => unknown) {
    const event = new RequestContextEvent();
    this.dispatchEvent(event);

    try {
      return fetcher(event.Data);
    } catch {
      return undefined;
    }
  }

  #listener: ((e: Event) => void) | undefined;

  use_context(fetcher: (ctx: Context) => unknown) {
    const result = this.#get_value(fetcher);

    if (this.#listener) {
      document.removeEventListener(ContextChangedKey, this.#listener);
    }

    this.#listener = (e: Event) => {
      if (e.target === this || this.#get_value(fetcher) === result) return;
      this.dispatchEvent(new ShouldRender());
    };

    document.addEventListener(ContextChangedKey, this.#listener);
    return result;
  }

  #context_key: string | undefined;
  #context_value: unknown;

  #context_providing = false;
  provide_context(key: string, data: unknown) {
    this.#context_key = key;
    this.#context_value = data;

    if (!this.#context_providing) {
      this.#context_providing = true;

      this.addEventListener(ContextEventKey, (e: Event) => {
        if (!(e instanceof RequestContextEvent) || e.target === this) return;
        e.AddData(this.#context_key ?? "", this.#context_value);
      });
    }

    this.dispatchEvent(new ContextChangedEvent());
  }
}
