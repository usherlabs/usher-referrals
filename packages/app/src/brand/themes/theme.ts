import { defaultTheme, mergeTheme, useTheme } from "evergreen-ui";
import { brandConfig } from "@/brand";

const backupFonts = {
	display: [
		"SF UI Display",
		"-apple-system",
		"BlinkMacSystemFont",
		"Helvetica",
		"Arial",
		"sans-serif",
		"Apple Color Emoji",
		"Segoe UI Emoji",
		"Segoe UI Symbol"
	],
	ui: [
		"SF UI Text",
		"-apple-system",
		"BlinkMacSystemFont",
		"Helvetica",
		"Arial",
		"sans-serif",
		"Apple Color Emoji",
		"Segoe UI Emoji",
		"Segoe UI Symbol"
	],
	mono: [
		"SF Mono",
		"Monaco",
		"Inconsolata",
		"Fira Mono",
		"Droid Sans Mono",
		"Source Code Pro",
		"monospace"
	]
};

const joinFonts = (...fonts: string[]) => fonts.join(", ");
export const theme = mergeTheme(defaultTheme, {
	colors: {
		aWhite: {
			"0": "hsla(0, 0%, 100%, 0.95)",
			"1": "hsla(0, 0%, 100%, 0.85)",
			"2": "hsla(0, 0%, 100%, 0.75)",
			"3": "hsla(0, 0%, 100%, 0.65)",
			"4": "hsla(0, 0%, 100%, 0.45)",
			"5": "hsla(0, 0%, 100%, 0.35)",
			"6": "hsla(0, 0%, 100%, 0.30)",
			"7": "hsla(0, 0%, 100%, 0.10)"
		},
		aBlack: {
			"0": "hsla(0, 0%, 0%, 0.85)",
			"1": "hsla(0, 0%, 0%, 0.80)",
			"2": "hsla(0, 0%, 0%, 0.70)",
			"3": "hsla(0, 0%, 0%, 0.60)",
			"4": "hsla(0, 0%, 0%, 0.50)",
			"5": "hsla(0, 0%, 0%, 0.45)",
			"6": "hsla(0, 0%, 0%, 0.35)",
			"7": "hsla(0, 0%, 0%, 0.15)"
		},
		sidePanel: brandConfig.colors.sidePanel ?? "#0A1B30",
		link: brandConfig.colors.links ?? "#2C9CF2"
	},
	// See https://github.com/segmentio/evergreen/blob/master/src/themes/deprecated/foundational-styles/fontFamilies.js
	fontFamilies: {
		/**
		 * @property {string} display - Used for headings larger than 20px.
		 */
		display: joinFonts(...brandConfig.font.display, ...backupFonts.display),

		/**
		 * @property {string} ui - Used for text and UI (which includes almost anything).
		 */
		ui: joinFonts(...brandConfig.font.ui, ...backupFonts.ui),

		/**
		 * @property {string} mono - Used for code and sometimes numbers in tables.
		 */
		mono: joinFonts(...brandConfig.font.mono, ...backupFonts.mono)
	}
} as const);

export type CustomTheme = typeof theme;

/**
 * Helper created to avoid repeating the type of the theme everywhere.
 */
export const useCustomTheme = () => useTheme<CustomTheme>();
