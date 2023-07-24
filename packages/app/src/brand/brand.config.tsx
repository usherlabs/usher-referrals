import {
	UilBookAlt,
	UilDiscord,
	UilGithub,
	UilStar
} from "@iconscout/react-unicons";
import {
	BrandLogoDark,
	BrandLogoLight,
	BrandLogomarkDark,
	BrandLogomarkLight
} from "@/brand/logo-components/BrandLogos";
import type { BrandConfig } from "./utils/type";

const config = {
	// use title case here. E.g.: Usher
	companyName: "Usher",
	// import SVG files and use them here
	logo: {
		light: BrandLogoLight,
		dark: BrandLogoDark
	},
	// Logomark is the icon that also represents the brand
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
	// these items will be displayed at the side panel
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
