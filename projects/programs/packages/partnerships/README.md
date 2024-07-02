# `@usher.so/partnerships`

Usher Partnerships is a package that simplifies partnership creation on behalf of end-users against a given Campaign.  
This way your users can register themselves as partners with any given Usher Campaign.  
Any authenticated DID (user) can fetch their related partnerships data and invite links through authentication with Usher's API.

## Methods

- **`addPartnership`**  
  Create a partnership against any Campaign on behalf of the most suitable Wallet/DID Authentication loaded in memory.
- **`createPartnership`**  
  Create a partnership against any Campaign on behalf of a specific Wallet/DID Authentication managed inside of [`@usher.so/auth`](packages/auth).
- **`loadRelatedPartnerships`**  
  Load all partnerships data indexed against the authenticated user.

## 📕 Documentation

- Usher Partnerships Typescript Docs: [https://ts-docs.programs.usher.so/modules/Usher_Partnerships](https://ts-docs.programs.usher.so/modules/Usher_Partnerships)

## Troubleshooting

- For questions, support, and discussions: [Join the Usher Discord](https://go.usher.so/discord)
- For bugs and feature requests: [Create an issue on Github](https://github.com/usherlabs/programs/issues)
