import { Pane } from "evergreen-ui";
import UserProvider from "@/providers/User";

const Screen = () => {
	return <Pane>Hello world</Pane>;
};

const Login = () => {
	return (
		<UserProvider>
			<Screen />
		</UserProvider>
	);
};

export default Login;
