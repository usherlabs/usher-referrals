import { useEffect } from "react";

import auth from "@/utils/auth-client";

const useAuthStateChange = (callback: (event: string) => void) => {
	useEffect(() => {
		const { data: authListener } = auth.onAuthStateChange(callback);
		return () => {
			authListener?.unsubscribe();
		};
	}, []);
};

export default useAuthStateChange;
