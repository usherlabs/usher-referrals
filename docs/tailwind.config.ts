import chroma from "chroma-js";
import {Config} from "tailwindcss";

const whiteRGB = "255, 255, 255";
const blackRGB = "0, 0, 0";

const colors = {
	transparent: "transparent",
	inherit: "inherit",

	/**
	 *    INITIAL TODO -    Control the colors
	 *
	 *  use any of these to generate a good combination of colors
	 *  https://huemint.com/website-1/
	 *  http://colormind.io/bootstrap/
	 *
	 *  Changing here is the easiest. If you need to fine tune specific component colors you may need to modify:
	 *  - src/styles/colors.scss
	 *  - specific ecosystem styles at their own files
	 */
	...generateColorShades("primary", "#0077ff"),
	...generateColorShades("secondary", "#bfa1ff"),
	...generateColorShades("emphasis", "#c24943"),

	...generateColorShades("warning", "#e8b830"),
	...generateColorShades("info", "#3b9df3"),
	...generateColorShades("success", "#28b863"),
	...generateColorShades("danger", "#d94141"),

	// it's more beautiful not to go full black, opacity makes it blend to the background to look even better
	black: withOpacity(blackRGB, 0.85),

	"black-1": withOpacity(blackRGB, 0.8),
	"black-2": withOpacity(blackRGB, 0.6),
	"black-3": withOpacity(blackRGB, 0.5),
	"black-4": withOpacity(blackRGB, 0.4),
	"black-5": withOpacity(blackRGB, 0.3),
	"black-6": withOpacity(blackRGB, 0.2),
	"black-7": withOpacity(blackRGB, 0.1),

	white: withOpacity(whiteRGB, 0.9),

	"white-1": withOpacity(whiteRGB, 0.8),
	"white-2": withOpacity(whiteRGB, 0.6),
	"white-3": withOpacity(whiteRGB, 0.5),
	"white-4": withOpacity(whiteRGB, 0.4),
	"white-5": withOpacity(whiteRGB, 0.3),
	"white-6": withOpacity(whiteRGB, 0.2),
	"white-7": withOpacity(whiteRGB, 0.1),

	// when opacity is not desirable
	...generateColorShades("grey", "#b8c2cc")
};

/**
 * TODO -    Control the fonts
 *            If you include any google fonts, you need to check
 */

// array means that is in order of preference (if not available, go to next)
const sansFonts = ["DM Sans", "Helvetica Neue", "sans-serif"];
const serifFonts = ["Liberation Serif", "Georgia", "serif"];
const monoFonts = ["Liberation Mono", "Courier New", "monospace", "monospace"];
const fonts = {
	title: ["Basier Circle", ...sansFonts],
	body: sansFonts,
	sans: sansFonts,
	serif: serifFonts,
	mono: monoFonts
};

export default {
	modules: {},
	corePlugins: {
		preflight: false
	},
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./docs/**/*.mdx"], // my markdown stuff is in ../docs, not /src
	darkMode: ["class", '[data-theme="dark"]'], // hooks into docusaurus' dark mode settigns

	plugins: [],
	theme: {
		extend: {
			colors,
			screens: {
				xs: "360px",
				sm: "576px",
				md: "768px",
				lg: "992px",
				xl: "1200px"
			},

			fonts,

			textSizes: {
				xs: ".75rem", // 12px
				sm: ".875rem", // 14px
				base: "1rem", // 16px
				lg: "1.125rem", // 18px
				xl: "1.25rem", // 20px
				"2xl": "1.5rem", // 24px
				"3xl": "1.875rem", // 30px
				"4xl": "2.25rem", // 36px
				"5xl": "3rem" // 48px
			},

			fontWeights: {
				hairline: 100,
				thin: 200,
				light: 300,
				normal: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
				extrabold: 800,
				black: 900
			},

			leading: {
				none: 1,
				tighter: 1.125,
				tight: 1.25,
				normal: 1.5,
				loose: 2
			},

			tracking: {
				tight: "-0.05em",
				normal: "0",
				wide: "0.05em"
			},

			textColors: colors,

			backgroundColors: colors,

			backgroundSize: {
				auto: "auto",
				cover: "cover",
				contain: "contain"
			},

			borderWidths: {
				default: "1px",
				"0": "0",
				"2": "2px",
				"4": "4px",
				"8": "8px"
			},

			borderColors: global.Object.assign(
				{ default: colors["grey-light"] },
				colors
			),

			borderRadius: {
				none: "0",
				sm: ".125rem",
				default: ".25rem",
				lg: ".5rem",
				full: "9999px"
			},

			width: {
				auto: "auto",
				px: "1px",
				"1": "0.25rem",
				"2": "0.5rem",
				"3": "0.75rem",
				"4": "1rem",
				"5": "1.25rem",
				"6": "1.5rem",
				"8": "2rem",
				"10": "2.5rem",
				"12": "3rem",
				"16": "4rem",
				"24": "6rem",
				"32": "8rem",
				"48": "12rem",
				"64": "16rem",
				"1/2": "50%",
				"1/3": "33.33333%",
				"2/3": "66.66667%",
				"1/4": "25%",
				"3/4": "75%",
				"1/5": "20%",
				"2/5": "40%",
				"3/5": "60%",
				"4/5": "80%",
				"1/6": "16.66667%",
				"5/6": "83.33333%",
				full: "100%",
				screen: "100vw"
			},

			height: {
				auto: "auto",
				px: "1px",
				1: "0.25rem",
				2: "0.5rem",
				3: "0.75rem",
				4: "1rem",
				5: "1.25rem",
				6: "1.5rem",
				8: "2rem",
				10: "2.5rem",
				12: "3rem",
				16: "4rem",
				24: "6rem",
				32: "8rem",
				48: "12rem",
				64: "16rem",
				full: "100%",
				screen: "100vh"
			},

			minWidth: {
				0: "0",
				full: "100%"
			},

			minHeight: {
				0: "0",
				full: "100%",
				screen: "100vh"
			},

			maxWidth: {
				xs: "20rem",
				sm: "30rem",
				md: "40rem",
				lg: "50rem",
				xl: "60rem",
				"2xl": "70rem",
				"3xl": "80rem",
				"4xl": "90rem",
				"5xl": "100rem",
				full: "100%"
			},

			maxHeight: {
				full: "100%",
				screen: "100vh"
			},

			padding: {
				px: "1px",
				0: "0",
				1: "0.25rem",
				2: "0.5rem",
				3: "0.75rem",
				4: "1rem",
				5: "1.25rem",
				6: "1.5rem",
				8: "2rem",
				10: "2.5rem",
				12: "3rem",
				16: "4rem",
				20: "5rem",
				24: "6rem",
				32: "8rem"
			},

			margin: {
				auto: "auto",
				px: "1px",
				0: "0",
				1: "0.25rem",
				2: "0.5rem",
				3: "0.75rem",
				4: "1rem",
				5: "1.25rem",
				6: "1.5rem",
				8: "2rem",
				10: "2.5rem",
				12: "3rem",
				16: "4rem",
				20: "5rem",
				24: "6rem",
				32: "8rem"
			},

			negativeMargin: {
				px: "1px",
				0: "0",
				1: "0.25rem",
				2: "0.5rem",
				3: "0.75rem",
				4: "1rem",
				5: "1.25rem",
				6: "1.5rem",
				8: "2rem",
				10: "2.5rem",
				12: "3rem",
				16: "4rem",
				20: "5rem",
				24: "6rem",
				32: "8rem"
			},

			shadows: {
				default: "0 2px 4px 0 rgba(0,0,0,0.10)",
				md: "0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)",
				lg: "0 15px 30px 0 rgba(0,0,0,0.11), 0 5px 15px 0 rgba(0,0,0,0.08)",
				inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
				outline: "0 0 0 3px rgba(52,144,220,0.5)",
				none: "none"
			},

			zIndex: {
				auto: "auto",
				0: 0,
				10: 10,
				20: 20,
				30: 30,
				40: 40,
				50: 50
			},

			opacity: {
				0: "0",
				25: ".25",
				50: ".5",
				75: ".75",
				100: "1"
			},

			svgFill: {
				current: "currentColor"
			},

			svgStroke: {
				current: "currentColor"
			}
		}
	}
} satisfies Config;

function generateColorShades(colorName, baseColor) {
	const color = chroma(baseColor);

	const bezierSteps = 6;

	const colorScaleToBlack = chroma
		.bezier([baseColor, "#000"])
		.scale()
		.correctLightness()
		.mode("lab")
	const colorScaleToWhite = chroma
		.bezier([baseColor, "#fff"])
		.scale()
		.correctLightness()
		.mode("lab")

	return {
		[`${colorName}-lightest`]: colorScaleToWhite(0.9).hex(),
		[`${colorName}-lighter`]: colorScaleToWhite(0.5).hex(),
		[`${colorName}-light`]: colorScaleToWhite(0.3).hex(),
		[`${colorName}`]: baseColor,
		[`${colorName}-dark`]: colorScaleToBlack(0.3).hex(),
		[`${colorName}-darker`]: colorScaleToBlack(0.5).hex(),
		[`${colorName}-darkest`]: colorScaleToBlack(0.8).hex(),
	};}

function withOpacity(color, opacity) {
	return `rgba(${color}, ${opacity})`;
}
