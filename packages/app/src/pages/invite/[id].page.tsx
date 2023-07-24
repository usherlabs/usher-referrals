import { ApiResponse } from "@/types";

const Invite = () => {
	return null;
};

export const getServerSideProps = async ({
	res
}: {
	res: ApiResponse;
	query: { id: string };
}) => {
	res.writeHead(302, {
		// or 301
		Location: `https://app.usher.so/?ref=usher_legacy_invite`
	});
	res.end();
};

export default Invite;
