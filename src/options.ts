import ContextFetcher from "./base-classes/context-fetcher";

export default function options(self: ContextFetcher) {
  let options: Array<{
    text: string;
    value: string;
    disabled: boolean;
  }> = [];

  const on_change = (e: Event) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLSlotElement)) return;

    const nodes = target.assignedElements();
    const result: Array<any> = [];
    for (const node of nodes)
      result.push({
        text: node.textContent ?? "",
        value: node.getAttribute("value") ?? "",
        disabled: node.getAttribute("disabled") !== null,
      });

    options = result;
  };

  return {
    get data() {
      const items = self.use_string_context("options");
      return [...(items ?? []), ...options];
    },
    on_change,
  };
}
