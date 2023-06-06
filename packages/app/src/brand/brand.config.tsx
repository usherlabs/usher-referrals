import UsherLogoDark from "@/assets/usher-logos/usher-logo-dark.svg";
import UsherLogoLight from "@/assets/usher-logos/usher-logo-light.svg";
import BrandLogomarkDark from "@/assets/usher-logos/Usher-Logomark-Dark.svg";
import BrandLogomarkLight from "@/assets/usher-logos/Usher-Logomark-Light.svg";
import {
	UilBookAlt,
	UilDiscord,
	UilGithub,
	UilStar
} from "@iconscout/react-unicons";
import type { BrandConfig } from "./utils/type";

const config = {
	companyName: "Usher",
	logo: {
		light: UsherLogoLight,
		dark: UsherLogoDark
	},
	logomark: {
		light: BrandLogomarkLight,
		dark: BrandLogomarkDark
	},
	colors: {
		sidePanel: "#0A1B30",
		links: "#2C9CF2"
	},
	/**
	 * To include fonts in the app, don't forget to add the script at _document.tsx
	 * @see packages/app/src/pages/_document.tsx
	 */
	font: {
		display: ["DM Sans"],
		ui: ["DM Sans"],
		mono: ["DM Sans"]
	},
	menuItems: [
		{
			href: "https://usher.so/?ref=app",
			text: "About",
			icon: <UilStar size={28} />,
			isExternal: true
		},
		{
			href: "https://docs.usher.so/?ref=app",
			text: "Docs",
			icon: <UilBookAlt size={28} />,
			isExternal: true
		},
		{
			href: "https://go.usher.so/discord",
			text: "Discord",
			icon: <UilDiscord size={28} />,
			isExternal: true
		},
		{
			href: "https://github.com/usherlabs",
			text: "GitHub",
			icon: <UilGithub size={28} />,
			isExternal: true
		}
	]
} as BrandConfig;

export default config;
