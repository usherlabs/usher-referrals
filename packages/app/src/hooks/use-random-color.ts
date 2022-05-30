import { useTheme } from "evergreen-ui";

function useRandomColor() {
	const { colors } = useTheme();
	const rColors = [
		colors.gray500,
		colors.red500,
		colors.blue500,
		colors.green500,
		colors.orange500,
		colors.purple600
	];
	const r = Math.floor(Math.random() * rColors.length);
	const rColor = rColors[r];

	return rColor;
}

export default useRandomColor;
