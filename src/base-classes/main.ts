import { IComponent, ShouldRender } from "../deps.ts";
import {
  ContextChangedEvent,
  ContextChangedKey,
  ContextEventKey,
  RequestContextEvent,
} from "../events/context.ts";

export default abstract class BakeryBase
  extends HTMLElement
  implements IComponent
{
  abstract readonly props: Record<string, string>;
  abstract readonly internals: ElementInternals;
  abstract readonly root: ShadowRoot;

  #get_value(fetcher: (ctx: Record<string, unknown>) => unknown) {
    const event = new RequestContextEvent();
    this.dispatchEvent(event);

    try {
      return fetcher(event.Data);
    } catch {
      return undefined;
    }
  }

  use_context(fetcher: (ctx: Record<string, unknown>) => unknown) {
    const result = this.#get_value(fetcher);

    const handler = (e: Event) => {
      if (e.target === this || this.#get_value(fetcher) === result) return;
      document.removeEventListener(ContextChangedKey, handler);
      this.dispatchEvent(new ShouldRender());
    };

    document.addEventListener(ContextChangedKey, handler);

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
        if (!(e instanceof RequestContextEvent)) return;
        e.AddData(this.#context_key ?? "", this.#context_value);
      });
    }

    this.dispatchEvent(new ContextChangedEvent());
  }
}
