declare module "@iconscout/react-unicons" {
	import { SVGProps } from "react";

	export type IconProps = {
		color?: string;
		size?: string | number;
	} & SVGProps<SVGElement>;

	export type Icon = (props: IconProps) => JSX.Element;

	export const UilAnalytics: Icon;
	export const UilArrowCircleDown: Icon;
	export const UilArrowGrowth: Icon;
	export const UilAwardAlt: Icon;
	export const UilBookAlt: Icon;
	export const UilClockFive: Icon;
	export const UilCoins: Icon;
	export const UilComments: Icon;
	export const UilCornerDownRight: Icon;
	export const UilDiscord: Icon;
	export const UilDna: Icon;
	export const UilEllipsisV: Icon;
	export const UilExclamationOctagon: Icon;
	export const UilExternalLinkAlt: Icon;
	export const UilFileContract: Icon;
	export const UilGithub: Icon;
	export const UilGithubAlt: Icon;
	export const UilGlob: Icon;
	export const UilHardHat: Icon;
	export const UilLabel: Icon;
	export const UilLink: Icon;
	export const UilLockAccess: Icon;
	export const UilLockOpenAlt: Icon;
	export const UilNotes: Icon;
	export const UilSelfie: Icon;
	export const UilShieldCheck: Icon;
	export const UilStar: Icon;
	export const UilTwitter: Icon;
	export const UilUserCircle: Icon;
	export const UilUsersAlt: Icon;
	export const UilWallet: Icon;
}

interface Window {
	ethereum: Web3Provider;
	// ethereum: ExternalProvider
}
