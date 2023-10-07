import DirectionRender, { Instruction } from "./direction-render";
import * as spec from "./spec";
const motion_ok = "(prefers-reduced-motion: no-preference)";
const prefer_light = "(prefers-color-scheme: light)";
const prefer_dark = "(prefers-color-scheme: dark)";

export const pure_spacing = DirectionRender(spec.spacings);

export function padding(variant: string, ...directions: Array<Instruction>) {
  return [["padding", pure_spacing(variant, ...directions), undefined]];
}

export function margin(variant: string, ...directions: Array<Instruction>) {
  return [["margin", pure_spacing(variant, ...directions), undefined]];
}

export function gap(variant: string) {
  return [
    ["gap", pure_spacing(variant).split(" ").slice(0, 2).join(" "), undefined],
  ];
}

function get_colour(variant: string, shift = 1, alpha = 1) {
  const c = (r: number, g: number, b: number) => {
    return `rgba(${r * shift}, ${g * shift}, ${b * shift}, ${alpha})`;
  };

  const target = spec.colours[variant];
  return {
    background: [
      [c(...target.light.background), prefer_light],
      [c(...target.dark.background), prefer_dark],
    ],
    foreground: [
      [target.light.foreground, prefer_light],
      [target.dark.foreground, prefer_dark],
    ],
  };
}

export function colour(variant: string, shift = 1, alpha = 1) {
  const { background, foreground } = get_colour(variant, shift, alpha);
  return [
    ...background.map((b) => ["background-color", ...b]),
    ...foreground.map((f) => ["color", ...f]),
  ];
}

export function textcolour(variant: string, shift = 1, alpha = 1) {
  const { background } = get_colour(variant, shift, alpha);
  return [...background.map((b) => ["color", ...b])];
}

export function backgroundcolour(variant: string, shift = 1, alpha = 1) {
  const { foreground } = get_colour(variant, shift, alpha);
  return [...foreground.map((b) => ["background-color", ...b])];
}

export function outline(variant: string, shift = 1, alpha = 1) {
  const { background } = get_colour(variant, shift, alpha);
  return [...background.map(([c, m]) => ["box-shadow", `0 0 0 4px ${c}`, m])];
}

export function shadow(variant: string) {
  const target = spec.shadows[variant];
  return [
    [
      "box-shadow",
      [
        target.light.x,
        target.light.y,
        target.light.radius,
        target.light.spread,
        target.light.colour,
      ].join(" "),
      prefer_light,
    ],
    [
      "box-shadow",
      [
        target.dark.x,
        target.dark.y,
        target.dark.radius,
        target.dark.spread,
        target.dark.colour,
      ].join(" "),
      prefer_dark,
    ],
  ];
}

export function border(variant: string, colour?: string, direction?: string) {
  const accessor = colour ? "background" : "foreground";
  const target = spec.borders[variant];
  const border_name = "border" + (direction ? "-" + direction : "");
  return [
    ...get_colour(colour ?? "headline")[accessor].map(([colour, media]) => [
      border_name,
      `${target.width} ${target.render} ${colour}`,
      media,
    ]),
    ...(!direction ? [["border-radius", target.radius, undefined]] : []),
  ];
}

export function text(variant: string, no_margin?: "no-margin") {
  const result = spec.text_styles[variant];
  if (!result) throw new Error("Invalid text");

  return [
    ["font-family", result.font_family, undefined],
    ["font-weight", result.font_weight, undefined],
    ["font-size", result.font_size, undefined],
    ["line-height", spec.line_height, undefined],
    ...(no_margin ? [] : margin(result.margin)),
  ];
}

export function transition(speed: string, ...targets: Array<string>) {
  return [
    [
      "transition",
      targets.map((t) => `${t} ${spec.animation_speeds[speed]}`).join(", "),
      motion_ok,
    ],
  ];
}

export function animation(name: string, speed: string, repeat: string) {
  return [
    ["animation-name", name, motion_ok],
    ["animation-timing-function", "linear", motion_ok],
    ["animation-duration", spec.animation_speeds[speed], motion_ok],
    ["animation-iteration-count", repeat ?? "1", motion_ok],
  ];
}
