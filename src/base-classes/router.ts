import { ShouldRender, RenderEvent } from "../deps";
import PaginationEvent from "../pagination";
import BakeryBase from "./main";

const DATA_KEY = "route";

const NavigationEventKey = "NavigationEvent";

class NavigateEvent extends Event {
  constructor() {
    super(NavigationEventKey);
  }
}

class MatchEvent extends Event {
  readonly #matchs: boolean;
  readonly #params: Record<string, string>;

  constructor(matches: boolean, params: Record<string, string>) {
    super("MatchChanged", { bubbles: true, composed: true });

    this.#matchs = matches;
    this.#params = params;
  }

  get Matches() {
    return this.#matchs;
  }

  get Params() {
    return this.#params;
  }
}

export abstract class UrlBuilder extends BakeryBase {
  #skip = 0;
  #take = 50;

  get #language() {
    if (navigator.languages != undefined) return navigator.languages[0];
    return navigator.language;
  }

  #statement(data: string) {
    return new Function("locale", "skip", "take", "return " + data).call(
      this,
      this.#language,
      this.#skip.toString(),
      this.#take.toString()
    );
  }

  constructor(target: HTMLElement) {
    super(target);

    this.addEventListener(PaginationEvent.Key, (e) => {
      if (!(e instanceof PaginationEvent)) return;

      this.#skip = e.Skip;
      this.#take = e.Take;
    });
  }

  Render(url: string) {
    return url.replace(/{{((?:(?!}}).)+)}}/gm, (_, match) =>
      this.#statement(match)
    );
  }
}

export default abstract class Router extends BakeryBase {
  abstract path: string;
  abstract exact: boolean;

  #previous = false;

  constructor(target: HTMLElement) {
    super(target);
    document.addEventListener(NavigationEventKey, () =>
      this.dispatchEvent(new ShouldRender())
    );
    self.addEventListener("popstate", () =>
      this.dispatchEvent(new ShouldRender())
    );

    this.addEventListener(RenderEvent.Key, () => {
      const current = this.Matches;
      if (current.match)
        this.provide_context(DATA_KEY, {
          used: current.used,
          params: current.params,
        });

      if (current.match === this.#previous) return;

      this.#previous = current.match;
      setTimeout(
        () => this.dispatchEvent(new MatchEvent(current.match, current.params)),
        5
      );
    });
  }

  get CurrentlyMatching() {
    return this.Matches.match;
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

  get params() {
    return this.Matches.params;
  }

  get Matches() {
    if (!this.path) return { match: false, params: {} };
    // deno-lint-ignore no-explicit-any
    const existing: any = this.state[DATA_KEY];
    const { used, params } = existing ?? { used: 0, params: {} };
    const final_params = { ...params };
    const path_parts = window.location.pathname
      .split("/")
      .filter((p) => p)
      .slice(used);
    const check_parts = this.path.split("/").filter((p) => p);
    if (path_parts.length < check_parts.length)
      return { match: false, params: {} };

    const exact = this.exact;
    if (exact && path_parts.length !== check_parts.length)
      return { match: false, params: {} };

    for (let i = 0; i < check_parts.length; i++) {
      const check_part = check_parts[i];
      const path_part = path_parts[i];

      if (check_part.startsWith(":"))
        final_params[check_part.replace(":", "")] = path_part;
      else if (path_part === check_part) continue;
      else return { match: false, params: {} };
    }

    return {
      match: true,
      params: final_params,
      used: used + check_parts.length,
    };
  }
}
