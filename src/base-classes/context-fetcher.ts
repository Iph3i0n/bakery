import BakeryBase from "./main.ts";

export default abstract class ContextFetcher extends BakeryBase {
  use_string_context(prop_name: string) {
    // deno-lint-ignore no-explicit-any
    const checker = (this as any)[prop_name];

    if (typeof checker !== "string") return checker;
    return this.use_context((ctx) => {
      const fetcher = new Function(...Object.keys(ctx), "return " + checker);

      return fetcher(...Object.keys(ctx).map((k) => ctx[k]));
    });
  }
}
