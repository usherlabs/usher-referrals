import {
	UilArrowGrowth,
	UilBookAlt,
	// Temporary hidden
	// UilComments,
	UilDiscord,
	UilGithub,
	UilLink,
	UilStar,
	UilUsersAlt
} from "@iconscout/react-unicons";
import { ReactElement } from "react";

export type MenuItem = {
	href: string;
	text: string;
	icon?: ReactElement;
	isExternal?: boolean;
	isSecured?: boolean;
};

const mainItems: MenuItem[] = [
	{
		href: "/collections",
		text: "Collections",
		icon: <UilLink size={28} />,
		isSecured: true
	},
	// Temporary hidden
	// {
	// 	href: "/conversions",
	// 	text: "Conversions",
	// 	icon: <UilComments size={28} />,
	// 	isSecured: true
	// },
	{
		href: "/",
		text: "Partnerships",
		icon: <UilUsersAlt size={28} />,
		isSecured: true
	},
	{
		href: "/explore",
		text: "Campaigns",
		icon: <UilArrowGrowth size={28} />
	}
];

const footerItems: MenuItem[] = [
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

export const menu = {
	mainItems,
	footerItems
};
