import { UilArrowGrowth, UilLink, UilUsersAlt } from "@iconscout/react-unicons";
import { ReactElement } from "react";
import brandConfig from "@/brand/brand.config";

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

export const menu = {
	mainItems,
	footerItems: brandConfig.menuItems
};
