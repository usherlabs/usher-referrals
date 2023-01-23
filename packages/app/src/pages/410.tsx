import Serve410 from "@/components/Serve410";

const PageNotFound = () => {
	return <Serve410 />;
};

export async function getStaticProps() {
	return {
		props: {
			seo: {
				title: "Link Archived",
				description: "This link has been Archived!"
			}
		}
	};
}

export default PageNotFound;
