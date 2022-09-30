import {
  arangoDatabase,
  arangoPassword,
  arangoUrl,
  arangoUsername
} from "../config";
import { Database } from "arangojs";

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
