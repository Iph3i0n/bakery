import { ComponentBase, ShouldRender } from "../deps.ts";
import {
  ContextChangedEvent,
  ContextChangedKey,
  ContextEventKey,
  RequestContextEvent,
} from "../events/context.ts";
import { screen_sizes } from "../spec.ts";

// deno-lint-ignore no-explicit-any
type Context = Record<string, any>;

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

  use_breakpoint(
    width: number,
    unit: "px" | "rem",
    watch: HTMLElement = this,
    inverse = false
  ) {
    const target = unit === "px" ? width : this.#rem_to_pixels(width);
    const current = inverse
      ? target > watch.offsetWidth
      : watch.offsetWidth > target;

    const handler = () => {
      if (!this || !this.isConnected) {
        // deno-lint-ignore no-window-prefix
        window.removeEventListener("resize", handler);
        observer.unobserve(watch);
      }
      const next = inverse
        ? target > watch.offsetWidth
        : watch.offsetWidth > target;
      if (next !== current) {
        // deno-lint-ignore no-window-prefix
        window.removeEventListener("resize", handler);
        observer.unobserve(watch);
        this.dispatchEvent(new ShouldRender());
      }
    };

    const observer = new ResizeObserver(handler);
    observer.observe(watch);

    return current;
  }

  use_spec_query(item: string, watch: HTMLElement = this) {
    return this.use_breakpoint(screen_sizes[item].query, "px", watch);
  }

  use_spec_width(item: string, watch: HTMLElement = this) {
    return this.use_breakpoint(screen_sizes[item].width, "px", watch);
  }
}
