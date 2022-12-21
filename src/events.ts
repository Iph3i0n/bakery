export function On(
  key: string,
  selector: string,
  handler: (e: Event, t: Element) => void
) {
  const h = (e: Event) => {
    const main_target = e.target as HTMLElement;
    const target = main_target.closest(selector);
    if (target) {
      handler(e, target);
    }
  };

  document.addEventListener(key, h);

  return () => document.removeEventListener(key, h);
}
