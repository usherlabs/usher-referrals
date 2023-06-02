import {
	UilBookAlt,
	UilDiscord,
	UilGithub,
	UilStar
} from "@iconscout/react-unicons";
import { MenuItem } from "@/menu";

export const footerItems: MenuItem[] = [
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
];
