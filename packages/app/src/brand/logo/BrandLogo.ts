import BrandLogoIconDark from "@/assets/logo/Usher-Logo-Icon.svg";
import BrandLogoIconLight from "@/assets/logo/Usher-Logo-Icon-White.svg";
import BrandLogoImageDark from "@/assets/logo/Usher-Logo.png";
// import BrandLogoLight from "@/assets/logo/Usher-Logo-White.svg";

/**
 * Why exporting it like this?
 * There may be situations where Usher, as a technology, is required to be used as a reference.
 * In that case, we will import Usher-Logo directly.
 * If it' s a rebrand, we will use and modify BrandLogo instead.
 */
export {
	BrandLogoImageDark,
	BrandLogoImageDark as BrandLogoImageLight,
	BrandLogoIconDark,
	BrandLogoIconLight
};
