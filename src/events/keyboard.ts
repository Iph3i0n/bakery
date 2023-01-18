export function on_key_handler(handlers: Record<string, () => void>) {
  return (e: KeyboardEvent) => {
    const target = handlers[e.key];
    if (!target) return;
    e.preventDefault();
    target();
  };
}
