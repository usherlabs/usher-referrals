import { Connections } from "@usher.so/shared";

export type Link = {
	id: string;
	title: string;
	publicUrl: string;
	destinationUrl: string;
	connections?: Connections[];
	createdAt: number;
	hits: number;
	redirects: number;
};

export type LinkStats = {
	id: string;
	hits: number;
	redirects: number;
};

export type CollectionRecord = {
	id: string;
	linkId: string;
	hitAt: number;
	connection: Connections;
	address: string;
	lastActivityAt: number;
};

export type LinkHit = {
	id: string;
	linkId: string;
	hitAt: number;
};

export type LinkRedirect = {
	id: string;
	linkId: string;
	connection: Connections;
	address: string;
	lastActivityAt: number;
};

// Dummy data used for development purposes.
// TODO: Have to be removed before go to production.

const hits: LinkHit[] = [];
const redirects: LinkRedirect[] = [];

export const dummyData = {
	hits,
	redirects
};
