// TODO: Wondering whether this is even required...

import dotenv from "dotenv";
import { Command } from "commander";
// import { supabase } from "@/utils/supabase-client";
// import { advertiser } from "@/env-config";

dotenv.config();
const program = new Command();

program
	.command("invite-link")
	.description(
		"Create a new Invite Link for your Affiliates to use for this Referral Campaign."
	)
	.argument("<string>", "The URL that the Invite Link will redirect to.")
	.action(async () => {
		// supabase.from("invite_links").insert([{}]);
		console.log("Hello world!");
	});

program.parse();
