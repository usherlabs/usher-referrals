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
const linkIds: string[] = [
	"kjzl6cwe1jw149x0wb3y5vemhsutsjn2npcyc92iypwqt9i6f3j2a3hzxiagz82",
	"kjzl6cwe1jw148baqj7yn02tf1pcz6ykcuws7ulwopb4zhqn58b6zywvouspadx",
	"kjzl6cwe1jw148ccg3yrh07252dletvl6q66wwq8uaoqdna9tx606qhsqgyikd9",
	"kjzl6cwe1jw14azr688d5eouk04f6xaardjz6r6a9xhcdfzwgod67hf9sh9rz60"
];

const dummyHit: LinkHit = {
	id: "100200301",
	connection: Connections.METAMASK,
	address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	lastActivityAt: new Date().getTime()
};

const dummyHits = 130;

const hits = Array<LinkHit>(dummyHits)
	.fill(dummyHit)
	.map((hit, i) => {
		return {
			...hit,
			id: (2000 + i).toString(),
			linkId: linkIds[i % linkIds.length],
			lastActivityAt: date
				.addMinutes(new Date(hit.lastActivityAt), -(3 * i))
				.getTime()
		};
	});

export const dummyData = {
	hits
};
