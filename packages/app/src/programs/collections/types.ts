import { Connections } from "@usher.so/shared";
import date from "date-and-time";

export type Link = {
	id: string;
	title: string;
	publicUrl: string;
	destinationUrl: string;
	connections?: Connections[];
	createdAt: number;
	hits: number;
	// redirects: number;
};

export type LinkHit = {
	id: string;
	connection: Connections;
	address: string;
	lastActivityAt: number;
};

// Dummy data used for development purposes.
// TODO: Have to be removed before go to production.
const dummyLink1: Link = {
	id: "kjzl6cwe1jw149c7h6jytcm2tgsellwmjfq3iox11orsufcvc9b9o7vswn3tq8l",
	title: "Express Wallet Checkout",
	publicUrl: "app.usher.so/express-wallet-checkout",
	destinationUrl:
		"https://b.stripecdn.com/docs-statics/rocket-rides-express.e98682f9952040439f72c9c4",
	connections: [Connections.ARCONNECT, Connections.METAMASK],
	createdAt: date.addDays(new Date(), -5).getTime(),
	hits: 78
};

const dummyLink2: Link = {
	id: "2001",
	title: "Partpack Online - Review",
	publicUrl: "app.usher.so/partpack-online-review",
	destinationUrl:
		"https://b.stripecdn.com/docs-statics/rocket-rides-express.e98682f9952040439f72c9c4",
	createdAt: date.addDays(new Date(), -10).getTime(),
	hits: 78
};

const dummyHit: LinkHit = {
	id: "100200301",
	connection: Connections.METAMASK,
	address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	lastActivityAt: new Date().getTime()
};

const dummyLinks = 2;
const dummyHits = 50;

const links: Link[] = [
	dummyLink1,
	...Array<Link>(dummyLinks)
		.fill(dummyLink2)
		.map((link, i) => {
			return {
				...link,
				id: (2000 + i).toString(),
				createdAt: date.addDays(new Date(link.createdAt), -(2 ** i)).getTime()
			};
		})
];

const hits = Array<LinkHit>(dummyHits)
	.fill(dummyHit)
	.map((hit, i) => {
		return {
			...hit,
			id: (2000 + i).toString(),
			linkId: links[i % links.length]?.id,
			lastActivityAt: date
				.addMinutes(new Date(hit.lastActivityAt), -(3 * i))
				.getTime()
		};
	});

links.forEach((link) => {
	link.hits = hits.filter((hit) => hit.linkId === link.id).length;
});

export const dummyData = {
	links,
	hits
};
