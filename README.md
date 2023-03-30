# Underlay export to Wiki Table

This repo offers an exporting script that demonstrates updating a wikitable from an underlay collection.

## Running the script
To get started, begin by running 
```
cp .env.sample .env
npm install
```

- Update the .env file with your wiki login credentials.
- Verify the `ulCollection`, `ulCollectionVersion`, and `wikiPageDestination` parameters at the top of `main.js`
- Run `npm start`
