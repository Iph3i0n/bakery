export default function slotted() {
  let has_value = false;
  return {
    get has_children() {
      return has_value;
    },
    on_change(e: Event) {
      const target = e.currentTarget;
      if (!(target instanceof HTMLSlotElement)) return;

      has_value = target.assignedNodes().length > 0;
    },
  };
}
