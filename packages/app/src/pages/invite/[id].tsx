import { ApiResponse } from "@/types";

const Invite = () => {
	return null;
};

export const getServerSideProps = async ({
	res,
	query: { id }
}: {
	res: ApiResponse;
	query: { id: string };
}) => {
	res.writeHead(302, {
		// or 301
		Location: `https://uap.usher.so/invite/${id}`
	});
	res.end();
};

export default Invite;
