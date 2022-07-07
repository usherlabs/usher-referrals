export const ARCONNECT_CHROME_URL =
	"https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap" as const;
export const ARCONNECT_FIREFOX_URL =
	"https://addons.mozilla.org/en-US/firefox/addon/arconnect/" as const;

export const MAX_SCREEN_WIDTH = 1280 as const;

export const CONVERSION_COOKIE_NAME = "__usher_token" as const;
export const CONVERSION_COOKIE_OPTIONS = {
	maxAge: 30 * 24 * 60 * 60, // 30 days
	path: "/satellite"
} as const;

export const APP_DID =
	"did:key:z6MknpBzdxp69WYL4zRdsdRVSyq48iw5WsYdSGXSonXyGRoW" as const;

export const REFERRAL_TOKEN_DELIMITER = "_" as const;

export const FEE_MULTIPLIER = 0.1;
