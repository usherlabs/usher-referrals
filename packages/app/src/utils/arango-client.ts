import { Database } from "arangojs";

import {
	arangoUrl,
	arangoDatabase,
	arangoUsername,
	arangoPassword
} from "@/server/env-config";

let db: Database | null | undefined;

export const getArangoClient = () => {
	if (!db) {
		db = new Database({
			url: arangoUrl,
			databaseName: arangoDatabase || "",
			auth: { username: arangoUsername || "", password: arangoPassword || "" }
		});
	}
	return db;
};
