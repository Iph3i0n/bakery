export default function c(...data: Array<string | [string, boolean]>) {
  return data
    .map((d) => (typeof d === "string" ? d : d[1] ? d[0] : undefined))
    .filter((d) => d)
    .join(" ");
}
