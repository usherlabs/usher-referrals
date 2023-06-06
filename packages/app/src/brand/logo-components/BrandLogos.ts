import BrandLogomarkDark from "@/assets/usher-logos/Usher-Logomark-Dark.svg";
import BrandLogomarkLight from "@/assets/usher-logos/Usher-Logomark-Light.svg";
import BrandLogoDark from "@/assets/usher-logos/usher-logo-dark.svg";
import BrandLogoLight from "@/assets/usher-logos/usher-logo-light.svg";
// import BrandLogoLight from "@/assets/logo/Usher-Logo-White.svg";

/**
 * Why exporting it like this?
 * There are situations where Usher, as a technology, is required to be used as a reference.
 * In that case, we will import Usher-Logo directly.
 * If it' s a rebrand, we will use and modify BrandLogo instead.
 */
export { BrandLogoLight, BrandLogoDark, BrandLogomarkDark, BrandLogomarkLight };
