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
import { Link, LinkConnection } from "@/programs/collections/types";
import modelAliases from "@/programs/datamodels/aliases/Links.json" assert { type: "json" };

const COLLECTIONS_QUERY_KEY = "collections";
const CONNECTIONS_QUERY_KEY = "connections";

export interface ICollectionsContext {
	isLoading: boolean;
	isSaving: boolean;
	links: Link[];
	currentLink?: Link;
	isConnectionsLoading: boolean;
	connections: LinkConnection[];
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
	archiveLink: (id: string) => Promise<void>;
}

export const CollectionsContext = createContext<ICollectionsContext>({
	isLoading: false,
	isSaving: false,
	links: [],
	currentLink: undefined,
	isConnectionsLoading: false,
	connections: [],
	setCurrentLink: () => {
		//
	},
	createLink: async () => {
		//
	},
	updateLink: async () => {
		//
	},
	archiveLink: async () => {
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
	}, [user.wallets, auth]);

	const { isLoading: isLinksLoading, data: links } = useQuery({
		queryKey: [COLLECTIONS_QUERY_KEY, ceramic === undefined, user.wallets],
		queryFn: async () => {
			if (!ceramic) {
				return [];
			}

			const model = new DataModel({ ceramic, aliases: modelAliases });
			const store = new DIDDataStore({ ceramic, model });

			const { ids } = (await store.get(model.aliases.definitions.linkdef)) || {
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

			const liks = contents.filter((content) => !content.isArchived);

			const stats = (await api.collections(await auth.getAuthToken()).get())
				.data;

			liks.forEach((content) => {
				const linkStats = stats.find((s) => s.id === content.id);
				content.hits = linkStats?.hits || 0;
				content.redirects = linkStats?.redirects || 0;
			});

			return liks;
		}
	});

	const [currentLink, setCurrentLink] = useState<Link>();
	const [isSaving, setIsSaving] = useState(false);

	const { isLoading: isConnectionsLoading, data: connections } = useQuery({
		queryKey: [CONNECTIONS_QUERY_KEY, currentLink, currentLink === undefined],
		queryFn: async () => {
			if (!currentLink) {
				return [];
			}
			const response = (
				await api.collections(await auth.getAuthToken()).getById(currentLink.id)
			).data;

			return response;
		}
	});

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

			const linkIds = (await store.get(model.aliases.definitions.linkdef)) || {
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
			await store.set(model.aliases.definitions.linkdef, linkIds);

			await api
				.collections(await auth.getAuthToken())
				.post(createdLink.id.toString());

			setIsSaving(false);
			queryClient.invalidateQueries(COLLECTIONS_QUERY_KEY);
		},
		[ceramic, auth, queryClient]
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
		[ceramic, queryClient]
	);

	const archiveLink = useCallback(
		async (id: string) => {
			if (!ceramic) {
				return;
			}

			setIsSaving(true);

			const linkTileDocument = await TileDocument.load(ceramic, id);
			await linkTileDocument.update(
				snakecaseKeys({
					...(linkTileDocument.content as Link),
					isArchived: true
				})
			);

			setIsSaving(false);
			queryClient.invalidateQueries(COLLECTIONS_QUERY_KEY);
		},
		[ceramic, queryClient]
	);

	const context = useMemo<ICollectionsContext>(
		() => ({
			isLoading,
			isSaving,
			links: links || [],
			currentLink,
			isConnectionsLoading,
			connections: connections || [],
			setCurrentLink,
			createLink,
			updateLink,
			archiveLink
		}),
		[
			isLoading,
			isSaving,
			links,
			currentLink,
			isConnectionsLoading,
			connections,
			createLink,
			updateLink,
			archiveLink
		]
	);

	return (
		<CollectionsContext.Provider value={context}>
			{children}
		</CollectionsContext.Provider>
	);
};
