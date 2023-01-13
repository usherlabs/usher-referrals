import Serve410 from "@/components/Serve410";

const PageNotFound = () => {
	return <Serve410 />;
};

export async function getStaticProps() {
	return {
		props: {
			seo: {
				title: "Link Deactivated",
				description: "This link has been deactivated!"
			}
		}
	};
}

export default PageNotFound;
