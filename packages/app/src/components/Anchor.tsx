import React from "react";
import { Link, PaneProps } from "evergreen-ui";
import NextLink from "next/link";

export type Props = PaneProps & {
	href: string;
	external?: boolean;
	linkProps?: Record<string, any>;
	children: React.ReactNode;
};

const AffiliateLink: React.FC<Props> = ({
	href,
	external,
	linkProps,
	children,
	...props
}) => {
	return external ? (
		<Link href={href} target="_blank" rel="noopener noreferrer" {...props}>
			{children}
		</Link>
	) : (
		<NextLink href={href} passHref {...linkProps}>
			<Link {...props}>{children}</Link>
		</NextLink>
	);
};

export default AffiliateLink;
