import BrandLogoIconDark from "@/assets/logo/Usher-Logo-Icon.svg";
import BrandLogoIconLight from "@/assets/logo/Usher-Logo-Icon-White.svg";
import BrandLogoImageDark from "@/assets/logo/Usher-Logo.png";
import BrandLogomarkDark from "@/assets/logo/usher-logo-dark.svg";
import BrandLogomarkLight from "@/assets/logo/usher-logo-light.svg";
// import BrandLogoLight from "@/assets/logo/Usher-Logo-White.svg";

/**
 * Why exporting it like this?
 * There are situations where Usher, as a technology, is required to be used as a reference.
 * In that case, we will import Usher-Logo directly.
 * If it' s a rebrand, we will use and modify BrandLogo instead.
 */
export {
	BrandLogomarkLight,
	BrandLogomarkDark,
	BrandLogoImageDark,
	BrandLogoImageDark as BrandLogoImageLight,
	BrandLogoIconDark,
	BrandLogoIconLight
};
