import Serve404 from "@/components/Serve404";

const PageNotFound = () => {
	return <Serve404 />;
};

export async function getStaticProps() {
	return {
		props: {
			seo: {
				title: "Not Found",
				description: "We cannot found this page!"
			}
		}
	};
}

export default PageNotFound;
