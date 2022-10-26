// A Human-Readable ABI; for interacting with the contract, we
// must include any fragment we wish to use
export const erc20 = [
	// Read-Only Functions
	"function balanceOf(address owner) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",

	// Authenticated Functions
	"function transfer(address to, uint amount) returns (bool)",

	// Events
	"event Transfer(address indexed from, address indexed to, uint amount)"
];
