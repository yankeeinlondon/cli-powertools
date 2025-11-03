import { CSS_COLOR_LOOKUP } from "inferred-types/constants"
import { err, isCssRgbString, asRgbObject } from "inferred-types";
import type { AsRgbObject, CssNamedColor, CssRgb, Err } from "inferred-types/types";

type Lookup<T extends string> = T extends CssNamedColor
? typeof CSS_COLOR_LOOKUP[T]
: Err<
    `invalid-color/named`,
    `the color '${T}' is not a known named color for the web or CSS!`
>;

type ToRgbObject<T extends string> = Lookup<T> extends CssRgb
? AsRgbObject<Lookup<T>>
: Lookup<T> extends Error
    ? Lookup<T>
: Err<
    `invalid-color/named`,
    `The attempt to map the named color '' to a CSS Rgb string failed!`
>

/**
 * returns the RGB color (in CSS format) for a "named" color.
 */
export function getCssRgbFromNamedColor<T extends CssNamedColor>(color: T): Lookup<T> {
    return (
        color in CSS_COLOR_LOOKUP
            ? CSS_COLOR_LOOKUP[color] as Lookup<T>
            : err(
                "invalid-color/named", 
                `the color '${color}' is not a known named color for the web or CSS!`
            ) as unknown as Lookup<T>
    )
}

/**
 * **getRgbObjectFromNamedColor**`(color)`
 * 
 * returns an RGB object for a "named" CSS/Web color.
 */
export function getRgbObjectFromNamedColor<T extends CssNamedColor>(color: T): ToRgbObject<T> {
    return (
        color in CSS_COLOR_LOOKUP
            ? isCssRgbString(CSS_COLOR_LOOKUP[color])
                ? asRgbObject(CSS_COLOR_LOOKUP[color]) as ToRgbObject<T>
                : err(
                    "invalid-color/named",
                    `The named color -- ${color} -- was unable to be converted to a CSS RGB representation (though the color is a known color)!`
                ) as unknown as ToRgbObject<T>
            
            : err(
                "invalid-color/named", 
                `the color '${color}' is not a known named color for the web or CSS!`
            ) as unknown as ToRgbObject<T>
    )
}
