import React from "react";
import { Link } from "evergreen-ui";
import NextLink from "next/link";

export type Props = {
	href: string;
	linkProps?: Record<string, any>;
	children: React.ReactNode;
};

const AffiliateLink: React.FC<Props> = ({
	href,
	linkProps,
	children,
	...props
}) => {
	return (
		<NextLink href={href} passHref {...linkProps}>
			<Link {...props}>{children}</Link>
		</NextLink>
	);
};

export default AffiliateLink;
