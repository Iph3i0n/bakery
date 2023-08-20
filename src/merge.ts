// deno-lint-ignore no-explicit-any
export default function Merge<T>(input: T, overrides: any): T {
  if (!overrides) return input;

  if (typeof input !== "object") return overrides;

  if (Array.isArray(input)) {
    // deno-lint-ignore no-explicit-any
    const result: any = [];
    for (let i = 0; i < input.length; i++)
      result.push(Merge(input[i], overrides[i]));
    return result;
  }

  // deno-lint-ignore no-explicit-any
  const result: any = {};

  for (const key in input)
    if (key in overrides) result[key] = Merge(input[key], overrides[key]);
    else result[key] = input[key];

  return result;
}
