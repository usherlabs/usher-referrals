export type BrandConfig = {
	companyName: string;
	/// logomark is the icon that appears in the logo
	logomark: {
		light: string;
		dark: string;
	};
	/// logo is the full logo, including the logomark and generally the company name
	logo: {
		light: string;
		dark: string;
	};
	/// we will generate all the favicons from this source
	/// if you don't need a specific favicon, you can leave it blank and logomark will be used
	faviconSource?: string;
	/// metadata is used for SEO and social media links
	metadata: {
		description: string;
	};
	font: {
		/// Used for headings larger than 20px.
		display: string[];
		/// Used for text and UI (which includes almost anything).
		ui: string[];
		/// Used for code and sometimes numbers in tables.
		mono: string[];
	};
	colors: {
		sidePanel?: string;
		links?: string;
	};
	menuItems: {
		text: string;
		icon: string;
		isExternal?: boolean;
		href: string;
	}[];
};
