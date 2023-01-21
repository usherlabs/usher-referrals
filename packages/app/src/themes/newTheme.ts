import { mergeTheme } from "evergreen-ui";
import { theme } from "./theme";

export const newTheme = mergeTheme(theme, {
	// Custom appearance for evergreen components
	// See https://evergreen.segment.com/introduction/theming#custom_appearances
	components: {
		Button: {
			// The following theming for Button breaks its apprearance on a Dialog when
			// used with intent i.e. <Dialog intent="danger"></Dialog>
			// appearances: {
			// 	default: {
			// 		backgroundColor: colors.background,
			// 		color: colors.text
			// 	},
			// 	primary: {
			// 		backgroundColor: colors.primary,
			// 		color: "#FFFFFF"
			// 	},
			// 	danger: {
			// 		backgroundColor: "#FFFFFF",
			// 		color: colors.danger,
			// 		border: `1px solid ${colors.danger}`,
			// 		_hover: {
			// 			backgroundColor: colors.danger,
			// 			color: "#FFFFFF"
			// 		}
			// 	}
			// },
			sizes: {
				medium: {
					height: "32px",
					borderRadius: "6px",
					fontSize: "16px",
					fontWeight: "500"
				},
				large: {
					height: "50px",
					borderRadius: "10px",
					fontSize: "20px",
					fontWeight: "500"
				}
			}
		},
		Input: {
			sizes: {
				medium: {
					height: "40px",
					borderRadius: "8px",
					fontSize: "16px"
				},
				large: {
					height: "50px",
					borderRadius: "10px",
					fontSize: "18px"
				}
			}
		},
		Label: {
			sizes: {
				400: {
					fontSize: "16px"
				}
			}
		}
		// Checkbox: {
		// 	baseStyle: {
		// 		fontSize: "12px",
		// 		color: "red",
		// 		backgroundColor: "red"
		// 	}
		// }
	}
});
