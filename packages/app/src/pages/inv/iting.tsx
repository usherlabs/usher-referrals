import { GetServerSideProps } from "next";
import nookies from "nookies";
import { Base64 } from "js-base64";
import { REFERRAL_COOKIE_OPTIONS } from "@/constants";

const Inviting = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res, query } = ctx;
	try {
		console.log(query);
		if (!(query && query.param)) {
			throw new Error("No param to continue Inviting");
		}

		console.log(Base64.decode(query.param as string));
		const dec = JSON.parse(Base64.decode(query.param as string));
		console.log(dec);
		const { key, value, url } = dec;

		nookies.set(ctx, key, value, REFERRAL_COOKIE_OPTIONS);

		res.writeHead(302, {
			Location: url
		});
		res.end();
	} catch (e) {
		res.writeHead(302, {
			Location: `/link-error`
		});
		res.end();
	}

	return {
		props: {}
	};
};

export default Inviting;
