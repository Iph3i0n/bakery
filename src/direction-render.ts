type Side = "top" | "bottom" | "left" | "right";
type Angle = "x" | "y";

export type Instruction = Side | Angle;

function Uniquify<T>(d: T, i: number, t: Array<T>) {
  return t.indexOf(d) === i;
}

const DirectionOrder = ["top", "right", "bottom", "left"];

export default function DirectionRender(
  options: Record<string, [string, string, string, string]>
) {
  return (variant: string, ...directions: Array<Instruction>) => {
    const target = options[variant];
    if (!target)
      throw new Error(
        "Invalid variant of " +
          variant +
          ". Options are " +
          JSON.stringify(Object.keys(options))
      );

    if (!directions.length) directions = ["top", "bottom", "left", "right"];

    const final = directions
      .flatMap((d) =>
        d === "x" ? ["left", "right"] : d === "y" ? ["top", "bottom"] : [d]
      )
      .filter(Uniquify);

    return target
      .map((t, i) => (final.includes(DirectionOrder[i]) ? t : "0"))
      .join(" ");
  };
}
