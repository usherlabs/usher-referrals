declare module "@iconscout/react-unicons" {
	import { SVGProps } from "react";

	export type IconProps = {
		color?: string;
		size?: string | number;
	} & SVGProps<SVGElement>;

	export type Icon = (props: IconProps) => JSX.Element;

	export const UilUserCircle: Icon;
	export const UilWallet: Icon;
	export const UilLockOpenAlt: Icon;
	export const UilTwitter: Icon;
	export const UilGlob: Icon;
	export const UilExternalLinkAlt: Icon;
	export const UilHardHat: Icon;
	export const UilLockAccess: Icon;
	export const UilDna: Icon;
	export const UilCoins: Icon;
}

declare module "@usher/ceramic";
