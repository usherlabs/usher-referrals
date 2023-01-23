import { TileDocument } from "@ceramicnetwork/stream-tile";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { Connections } from "@usher.so/shared";
import camelcaseKeys from "camelcase-keys";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";
import { useQuery, useQueryClient } from "react-query";
import snakecaseKeys from "snakecase-keys";

import * as api from "@/api";
import { useUser } from "@/hooks";
import { Link } from "@/programs/collections/types";
import modelAliases from "@/programs/datamodels/aliases/Links.json" assert { type: "json" };

const COLLECTIONS_QUERY_KEY = "collections";

export interface ICollectionsContext {
	isLoading: boolean;
	isSaving: boolean;
	links: Link[];
	currentLink?: Link;
	setCurrentLink: Dispatch<SetStateAction<Link | undefined>>;
	createLink: (link: {
		title: string;
		destinationUrl: string;
		connections: Connections[];
	}) => Promise<void>;
	updateLink: (
		id: string,
		link: {
			title: string;
			destinationUrl: string;
			connections: Connections[];
		}
	) => Promise<void>;
	deleteLink: (id: string) => Promise<void>;
}

export const CollectionsContext = createContext<ICollectionsContext>({
	isLoading: false,
	isSaving: false,
	links: [],
	currentLink: undefined,
	setCurrentLink: () => {
		//
	},
	createLink: async () => {
		//
	},
	updateLink: async () => {
		//
	},
	deleteLink: async () => {
		//
	}
});

type Props = {
	children: React.ReactNode;
};

export const CollectionsContextProvider: React.FC<Props> = ({ children }) => {
	const queryClient = useQueryClient();

	const { auth, user, isLoading: isUserLoading } = useUser();
	const ceramic = useMemo(() => {
		const [wallet] = user.wallets;
		if (!wallet) {
			return undefined;
		}
		return auth.getAuth(wallet.address).ceramic;
	}, [user, user.wallets, isUserLoading]);

	const {
		isLoading: isLinksLoading,
		data: links,
		refetch
	} = useQuery({
		queryKey: [COLLECTIONS_QUERY_KEY, ceramic === undefined],
		queryFn: async () => {
			if (!ceramic) {
				return [];
			}

			const model = new DataModel({ ceramic, aliases: modelAliases });
			const store = new DIDDataStore({ ceramic, model });

			const { ids } = (await store.get(model.aliases.definitions.LinksDef)) || {
				ids: []
			};

			const queries = ids.map((id: string) => ({
				streamId: id
			}));

			const streams = await ceramic.multiQuery(queries);
			const contents = Object.keys(streams).map((key) => ({
				...(camelcaseKeys(streams[key].content) as Link),
				id: key
			}));

			const stats = (await api.collections().get()).data;

			contents.forEach((content) => {
				const linkStats = stats.find((s) => s.id === content.id);
				content.hits = linkStats?.hits || 0;
				content.redirects = linkStats?.redirects || 0;
			});

			return contents;
		}
	});

	const [currentLink, setCurrentLink] = useState<Link>();
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const newCurrentlink = links?.find((link) => link.id === currentLink?.id);

		if (newCurrentlink && newCurrentlink === currentLink) {
			return;
		}

		if (newCurrentlink && newCurrentlink !== currentLink) {
			setCurrentLink(newCurrentlink);
		} else if (links && links.length > 0) {
			setCurrentLink(links[0]);
		} else {
			setCurrentLink(undefined);
		}
	}, [links, currentLink]);

	const isLoading = useMemo(() => {
		return isUserLoading || isLinksLoading;
	}, [isUserLoading, isLinksLoading]);

	const createLink = useCallback(
		async (link: {
			title: string;
			destinationUrl: string;
			connections: Connections[];
		}) => {
			if (!ceramic) {
				return;
			}
			setIsSaving(true);

			const model = new DataModel({ ceramic, aliases: modelAliases });
			const store = new DIDDataStore({ ceramic, model });

			const linkIds = (await store.get(model.aliases.definitions.LinksDef)) || {
				ids: []
			};

			const newLink = {
				...link,
				createdAt: new Date().getTime()
			};

			const createdLink = await TileDocument.create(
				ceramic,
				snakecaseKeys(newLink),
				{
					schema: model.aliases.schemas.Link,
					family: "usher:links"
				},
				{
					pin: true
				}
			);

			linkIds.ids.push(createdLink.id.toString());
			await store.set(model.aliases.definitions.LinksDef, linkIds);

			setIsSaving(false);
			queryClient.invalidateQueries(COLLECTIONS_QUERY_KEY);
		},
		[ceramic]
	);

	const updateLink = useCallback(
		async (
			id: string,
			link: {
				title: string;
				destinationUrl: string;
				connections: Connections[];
			}
		) => {
			if (!ceramic) {
				return;
			}
			setIsSaving(true);

			const linkTileDocument = await TileDocument.load(ceramic, id);
			await linkTileDocument.update(snakecaseKeys(link));

			setIsSaving(false);
			queryClient.invalidateQueries(COLLECTIONS_QUERY_KEY);
		},
		[ceramic]
	);

	const deleteLink = useCallback(
		async (id: string) => {
			if (!ceramic) {
				return;
			}

			// TODO: Is it possible to delete a stream from Ceramic?
			console.log(`Here we are going to delete the link ${id}`);

			refetch();
		},
		[ceramic]
	);

	const context = useMemo<ICollectionsContext>(
		() => ({
			isLoading,
			isSaving,
			links: links || [],
			currentLink,
			setCurrentLink,
			createLink,
			updateLink,
			deleteLink
		}),
		[isLoading, isSaving, links, currentLink, createLink]
	);

	return (
		<CollectionsContext.Provider value={context}>
			{children}
		</CollectionsContext.Provider>
	);
};
