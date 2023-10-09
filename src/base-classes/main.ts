import { ComponentBase, ShouldRender } from "../deps";
import {
  ContextChangedEvent,
  ContextChangedKey,
  ContextEventKey,
  RequestContextEvent,
  SetContextEvent,
} from "../events/context";
import { screen_sizes } from "../spec";

export default abstract class BakeryBase extends ComponentBase {
  #get_value(key: string | symbol) {
    const event = new RequestContextEvent();
    this.dispatchEvent(event);

    try {
      return event.Data[key];
    } catch {
      return undefined;
    }
  }

  get state() {
    // deno-lint-ignore no-explicit-any
    return new Proxy<any>(
      {},
      {
        get: (_, key) => {
          const result = this.#get_value(key);

          const listener = (e: Event) => {
            if (e.target === this.matcher || this.#get_value(key) === result)
              return;
            document.removeEventListener(ContextChangedKey, listener);
            this.should_render();
          };

          document.addEventListener(ContextChangedKey, listener);
          return result;
        },
        set: (_, key, value) => {
          const event = new SetContextEvent(key, value);
          this.dispatchEvent(event);
          return event.defaultPrevented;
        },
      }
    );
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
        if (!(e instanceof RequestContextEvent) || e.target === this.matcher)
          return;
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
    if (watch instanceof ComponentBase) watch = watch.matcher;
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

  dispatchEvent(event: Event): boolean {
    const handler_text = this.getAttribute("on" + event.type);
    if (handler_text) {
      const handler = new Function("event", handler_text);
      handler.call(this, event);
    }
    return this.matcher.dispatchEvent(event);
  }
}
