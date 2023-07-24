import config from "@/brand/brand.config";

export const brandConfig = {
	rebranded: config.companyName !== "Usher",
	...config
};
