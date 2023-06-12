/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import { useCustomTheme } from "@/brand/themes/theme";

function useDerivedColor(str: string) {
	const { colors } = useCustomTheme();
	const rColors = [
		colors.gray500,
		colors.red500,
		colors.blue500,
		colors.green500,
		colors.orange500,
		colors.purple600
	];

	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		hash &= hash;
	}
	hash = ((hash % rColors.length) + rColors.length) % rColors.length;

	const rColor = rColors[hash];

	return rColor;
}

export default useDerivedColor;
