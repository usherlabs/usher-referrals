// import Head from "next/head";
// import Image from "next/image";
import { Pane } from "evergreen-ui";
import Header from "@/components/Header";

const Home = () => {
	return (
		<Pane display="flex" padding={16}>
			<Header />
		</Pane>
	);
};

export default Home;
