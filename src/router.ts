import { Provider, Receiver } from "./data.ts";
import { ShouldRender } from "./deps.ts";

class NavigateEvent extends Event {
  constructor() {
    super("navigation-event");
  }
}

export default abstract class Router extends Receiver {
  abstract readonly props: Record<string, string>;

  readonly #provider: Provider;

  override fetcher_override = "routing_data";

  constructor() {
    super();
    // deno-lint-ignore no-explicit-any
    this.#provider = new Provider(this as any, this.fetcher_override);

    document.addEventListener("navigation-event", () =>
      this.dispatchEvent(new ShouldRender())
    );
    self.addEventListener("popstate", () =>
      this.dispatchEvent(new ShouldRender())
    );
  }

  Push(url: string) {
    window.history.pushState({}, "", url);
    document.dispatchEvent(new NavigateEvent());
  }

  Replace(url: string) {
    window.history.replaceState({}, "", url);
    document.dispatchEvent(new NavigateEvent());
  }

  get Matches() {
    const existing = this.data;
    // deno-lint-ignore no-explicit-any
    const { used, params } = (existing as any) ?? { used: 0, params: {} };
    const final_params = { ...params };
    const path_parts = window.location.pathname
      .split("/")
      .filter((p) => p)
      .slice(used);
    const check_parts = this.props.path.split("/").filter((p) => p);
    if (path_parts.length < check_parts.length) return false;

    for (let i = 0; i < check_parts.length; i++) {
      const check_part = check_parts[i];
      const path_part = path_parts[i];

      if (check_part.startsWith(":"))
        final_params[check_part.replace(":", "")] = path_part;
      else if (path_part === check_part) continue;
      else return false;
    }

    this.#provider.data = {
      used: used + check_parts.length,
      params: final_params,
    };

    return true;
  }
}
