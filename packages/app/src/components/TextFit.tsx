import { Pane, Text, TextProps } from "evergreen-ui";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props extends TextProps {
	children: string;
}

export const FitText: React.FC<Props> = ({ children: text, ...props }) => {
	const ref = useRef(null);
	const [visibleLength, setVisibleLength] = useState(text.length);

	useEffect(() => {
		if (ref.current) {
			const { scrollWidth, clientWidth } = ref.current;
			setVisibleLength(Math.floor((text.length * clientWidth) / scrollWidth));
		}
	});

	const result = useMemo(() => {
		return visibleLength < text.length
			? `${text.slice(0, visibleLength - 6)}…${text.slice(-4)}`
			: text;
	}, [visibleLength]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			overflow="hidden"
			justifyContent="center"
		>
			<Text
				ref={ref}
				{...props}
				visibility="hidden"
				height="0"
				whiteSpace="nowrap"
			>
				{text}
			</Text>
			<Text {...props}>{result}</Text>
		</Pane>
	);
};
