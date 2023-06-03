import { defaultTheme, mergeTheme, useTheme } from "evergreen-ui";

export const theme = mergeTheme(defaultTheme, {
	colors: {
		primary: {
			dark: "#0A1B30"
		},
		link: "#2C9CF2"
	},
	// See https://github.com/segmentio/evergreen/blob/master/src/themes/deprecated/foundational-styles/fontFamilies.js
	fontFamilies: {
		/**
		 * @property {string} display - Used for headings larger than 20px.
		 */
		display: `"DM Sans", "SF UI Display", -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,

		/**
		 * @property {string} ui - Used for text and UI (which includes almost anything).
		 */
		ui: `"DM Sans", "SF UI Text", -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,

		/**
		 * @property {string} mono - Used for code and sometimes numbers in tables.
		 */
		mono: `"DM Sans", "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace`
	}
} as const);

export type CustomTheme = typeof theme;

/**
 * Helper created to avoid repeating the type of the theme everywhere.
 */
export const useCustomTheme = () => useTheme<CustomTheme>();
