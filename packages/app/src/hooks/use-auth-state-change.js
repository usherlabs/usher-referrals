import { useEffect } from "react";

import { supabase } from "@/utils/supabase-client";

const useAuthStateChange = (callback) => {
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(callback);
		return () => {
			authListener?.unsubscribe();
		};
	}, []);
};

export default useAuthStateChange;
