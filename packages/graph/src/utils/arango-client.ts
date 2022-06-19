import { Database } from "arangojs";

import {
	arangoUrl,
	arangoDatabase,
	arangoUsername,
	arangoPassword
} from "@/env-config";

let db: Database | null | undefined;

export default () => {
	if (!db) {
		db = new Database({
			url: arangoUrl,
			databaseName: arangoDatabase || "",
			auth: { username: arangoUsername || "", password: arangoPassword || "" }
		});
	}
	return db;
};
