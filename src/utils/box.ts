import { narrow, StringKeys, RGB,  } from "inferred-types";

export type BoxCorners = {
    h: string;
    v: string;
    tl: string;
    tr: string;
    bl: string;
    br: string;
}

const CORNERS = narrow({
    ascii: {
        h: "-",
        v: "|",
        tl: "+",
        tr: "+",
        bl: "+",
        br: "+"
    },
    single: {
        h: "─",
        v: "│",
        tl: "┌",
        tr: "┐",
        bl: "└",
        br: "┘"
    },
    heavy: {
        h: "━",
        v: "┃",
        tl: "┏",
        tr: "┓",
        bl: "┗",
        br: "┛"
    },
    double: {
        h: "═",
        v: "║",
        tl: "╔",
        tr: "╗",
        bl: "╚",
        br: "╝"
    },
    rounded: {
        h: "─",
        v: "│",
        tl: "╭",
        tr: "╮",
        bl: "╰",
        br: "╯"
    },
}) satisfies Record<string, BoxCorners>;

export type BoxStyle = StringKeys<typeof CORNERS>[number];

export type BoxOptions = {
    style?: BoxStyle;
    interior?: RGB | [ fg: RGB, bg: RGB ];
    exterior?: RGB | [ fg: RGB, bg: RGB ];
}


export function box<S extends BoxStyle>(
    content: string, 
    style: S = "single" as S
) {
    const len = content.length;
    const c = CORNERS[style] as BoxCorners;
    const horizontal = c.h.repeat(len + 2);
    const top = `${c.tl}${horizontal}${c.tr}`;
    const bottom = `${c.bl}${horizontal}${c.br}`;

    const colorizer = (content: string) => `${content}`
    const interiorColor = (content: string) => `${content}`;

    console.log(colorizer(top));
    console.log(colorizer(`${c.v} ${content} ${c.v}`));
    console.log(colorizer(bottom));
}

