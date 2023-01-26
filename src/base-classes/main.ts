import { ComponentBase, ShouldRender } from "../deps.ts";
import {
  ContextChangedEvent,
  ContextChangedKey,
  ContextEventKey,
  RequestContextEvent,
} from "../events/context.ts";

// deno-lint-ignore no-explicit-any
type Context = Record<string, any>;

type BreakpointSpec = Array<{
  name: string;
  width: number;
  unit: "px" | "rem";
}>;

export default abstract class BakeryBase extends ComponentBase {
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

  #rem_to_pixels(rem: number) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }

  #active(spec: BreakpointSpec, watch: HTMLElement) {
    for (const item of spec) {
      if (!item) continue;

      const target =
        item.unit === "px" ? item.width : this.#rem_to_pixels(item.width);

      if (watch.offsetWidth > target) return item.name;
    }

    return "";
  }

  use_breakpoints(spec: BreakpointSpec, watch: HTMLElement = this) {
    let match = this.#active(spec, watch);

    const handler = () => {
      if (!this || !this.isConnected) {
        // deno-lint-ignore no-window-prefix
        window.removeEventListener("resize", handler);
        observer.unobserve(watch);
      }
      const old_active = match;
      match = this.#active(spec, watch);
      if (old_active !== match) this.dispatchEvent(new ShouldRender());
    };

    const observer = new ResizeObserver(handler);
    observer.observe(watch);

    // deno-lint-ignore no-window-prefix
    window.addEventListener("resize", handler);

    return {
      get match() {
        return match;
      },
    };
  }
}
