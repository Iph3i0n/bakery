import BakeryBase from "./main.ts";

export default abstract class ContextFetcher extends BakeryBase {
  use_string_context(prop_name: string) {
    // deno-lint-ignore no-explicit-any
    const checker = (this as any)[prop_name];

    if (typeof checker !== "string" || !checker.startsWith(":")) return checker;
    const fetcher = new Function("return " + checker.replace(":", ""));
    return fetcher.call(this);
  }
}
