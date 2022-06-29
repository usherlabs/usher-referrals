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
		Location: `https://go.usher.so/nft`
	});
	res.end();
};

export default Invite;
