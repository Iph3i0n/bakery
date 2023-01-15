export default function AddToGlobal(name: string, item: unknown) {
  // deno-lint-ignore no-explicit-any
  (window as any)[name] = item;
}
