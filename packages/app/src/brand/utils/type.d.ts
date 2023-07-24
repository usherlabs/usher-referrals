import { MenuItem } from "@/menu";

export type BrandConfig = {
	companyName: string;
	/// logomark is the icon that appears in the logo
	logomark: {
		light: React.ReactComponentElement;
		dark: React.ReactComponentElement;
	};
	/// logo is the full logo, including the logomark and generally the company name
	logo: {
		light: React.ReactComponentElement;
		dark: React.ReactComponentElement;
	};
	/// metadata is used for SEO and social media links
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
	menuItems: MenuItem[];
};
