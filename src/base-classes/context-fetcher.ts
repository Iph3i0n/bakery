import { ShouldRender } from "../deps.ts";
import BakeryBase from "./main.ts";

export default abstract class ContextFetcher extends BakeryBase {
  use_string_context(prop_name: string) {
    if (this.#data) return this.#data;
    const checker = this.props[prop_name];
    if (!checker) return undefined;

    return this.use_context((ctx) => {
      const fetcher = new Function(...Object.keys(ctx), "return " + checker);

      return fetcher(...Object.keys(ctx).map((k) => ctx[k]));
    });
  }

  #data: unknown;

  get data() {
    return this.#data;
  }

  set data(value: unknown) {
    this.#data = value;
    this.dispatchEvent(new ShouldRender());
  }
}
