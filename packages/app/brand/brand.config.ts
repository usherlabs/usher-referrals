import { BrandConfig } from "./type";

const config: BrandConfig = {
	companyName: "Usher",
	colors: {
		sidePanel: "#fff",
		links: "#fff"
	},
	font: {
		display: ["DM Sans", "SF UI Display"],
		ui: ["DM Sans", "SF UI Text"],
		mono: ["DM Sans", "SF Mono", "Monaco", "Inconsolata"]
	},
	menuItems: [
		{
			href: "https://usher.so/?ref=app",
			text: "About",
			icon: "star",
			isExternal: true
		},
		{
			href: "https://docs.usher.so/?ref=app",
			text: "Docs",
			icon: "book",
			isExternal: true
		},
		{
			href: "https://go.usher.so/discord",
			text: "Discord",
			icon: "discord",
			isExternal: true
		},
		{
			href: "https://github.com/usherlabs",
			text: "GitHub",
			icon: "github",
			isExternal: true
		}
	]
};

export default config;
