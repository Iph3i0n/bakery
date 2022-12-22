export default function options() {
  let options: Array<{
    text: string;
    value: string;
    disabled: boolean;
    default: boolean;
  }> = [];

  const on_change = (e: Event) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLSlotElement)) return;

    const nodes = target.assignedElements();
    const result = [];
    for (const node of nodes)
      result.push({
        text: node.textContent ?? "",
        value: node.getAttribute("value") ?? "",
        disabled: node.getAttribute("disabled") !== null,
        default: node.getAttribute("default") !== null,
      });

    options = result;
  };

  return {
    get data() {
      return options;
    },
    on_change,
  };
}
