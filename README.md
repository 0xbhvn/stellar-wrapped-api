# Stellar Wrapped API

[![Build Status](https://travis-ci.org/0xbhvn/stellar-wrapped-api.svg?branch=master)](https://travis-ci.org/0xbhvn/stellar-wrapped-api)
[![Coverage Status](https://coveralls.io/repos/github/0xbhvn/stellar-wrapped-api/badge.svg?branch=master)](https://coveralls.io/github/0xbhvn/stellar-wrapped-api?branch=master)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A Spotify-style wrap for what a wallet has done on-chain throughout the year, built using Node.js, Express, and Mongoose.

## Quick Start

Clone the repo:

```bash
git clone --depth 1 https://github.com/0xbhvn/stellar-wrapped-api.git
cd stellar-wrapped-api
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

Run the application:

```bash
yarn dev
```

## API Documentation

- **Local Swagger Docs**: After running the server, navigate to `http://localhost:3000/v1/docs` in your browser to view the automatically generated Swagger docs.
- **Notion Documentation**: For an always-available reference (including additional examples and explanations), visit our Notion page:[Stellar Wrapped Wallet API Documentation](https://www.notion.so/Stellar-Wrapped-Wallet-API-Documentation-16466e48216280179055d5c11d9bdb5a?pvs=21)

## Contributing

Contributions are more than welcome! Please check out the [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)
