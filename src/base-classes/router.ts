import { ShouldRender } from "../deps.ts";
import PaginationEvent from "../pagination.ts";
import BakeryBase from "./main.ts";

const DATA_KEY = "routing_data";

class NavigateEvent extends Event {
  constructor() {
    super("navigation-event");
  }
}

export abstract class UrlBuilder extends BakeryBase {
  #skip = 0;
  #take = 50;

  get #language() {
    if (navigator.languages != undefined) return navigator.languages[0];
    return navigator.language;
  }

  get #options() {
    const existing = this.use_context((ctx) => ctx[DATA_KEY]);

    // deno-lint-ignore no-explicit-any
    const params = existing ? (existing as any).params : {};
    return {
      locale: this.#language,
      skip: this.#skip.toString(),
      take: this.#take.toString(),
      ...Object.keys(params).reduce(
        (c, n) => ({ ...c, ["params." + n]: params[n] }),
        {}
      ),
    };
  }

  constructor() {
    super();

    this.addEventListener(PaginationEvent.Key, (e) => {
      if (!(e instanceof PaginationEvent)) return;

      this.#skip = e.Skip;
      this.#take = e.Take;
    });
  }

  Render(url: string) {
    const opts = this.#options;
    for (const key in opts)
      url = url.replaceAll(`{${key}}`, opts[key as keyof typeof opts]);

    return url;
  }
}

export default abstract class Router extends BakeryBase {
  constructor() {
    super();
    document.addEventListener("navigation-event", () =>
      this.dispatchEvent(new ShouldRender())
    );
    self.addEventListener("popstate", () =>
      this.dispatchEvent(new ShouldRender())
    );
  }

  static Push(url: string) {
    window.history.pushState({}, "", url);
    document.dispatchEvent(new NavigateEvent());
  }

  static Replace(url: string) {
    window.history.replaceState({}, "", url);
    document.dispatchEvent(new NavigateEvent());
  }

  Push(url: string) {
    Router.Push(url);
  }

  Replace(url: string) {
    Router.Replace(url);
  }

  get Matches() {
    // deno-lint-ignore no-explicit-any
    const existing: any = this.use_context((ctx) => ctx[DATA_KEY]);
    const { used, params } = existing ?? { used: 0, params: {} };
    const final_params = { ...params };
    const path_parts = window.location.pathname
      .split("/")
      .filter((p) => p)
      .slice(used);
    const check_parts = this.props.path.split("/").filter((p) => p);
    if (path_parts.length < check_parts.length) return false;

    const exact = this.props.exact;
    if (exact && path_parts.length !== check_parts.length) return false;

    for (let i = 0; i < check_parts.length; i++) {
      const check_part = check_parts[i];
      const path_part = path_parts[i];

      if (check_part.startsWith(":"))
        final_params[check_part.replace(":", "")] = path_part;
      else if (path_part === check_part) continue;
      else return false;
    }

    this.provide_context(DATA_KEY, {
      used: used + check_parts.length,
      params: final_params,
    });

    return true;
  }
}
