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
	isArchived: boolean;
};

export type LinkStats = {
	id: string;
	hits: number;
	redirects: number;
};

export type LinkConnection = {
	id: string;
	linkId: string;
	connection: Connections;
	address: string;
	timestamp: number;
};
