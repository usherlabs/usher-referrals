import BrandLogomarkDark from "@/brand/brand-assets/revault-logomark-dark.svg";
import BrandLogomarkLight from "@/brand/brand-assets/revault-logomark-light.svg";
import BrandLogoDark from "@/brand/brand-assets/revault-logo-dark.svg";
import BrandLogoLight from "@/brand/brand-assets/revault-logo-light.svg";

/**
 * Why exporting it like this?
 * There are situations where Usher, as a technology, is required to be used as a reference.
 * In that case, we will import Usher-Logo directly.
 * If it' s a rebrand, we will use and modify BrandLogo instead.
 */
export { BrandLogoLight, BrandLogoDark, BrandLogomarkDark, BrandLogomarkLight };
