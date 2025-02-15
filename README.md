# `address-verify`

A nicely robust implementation of an address verification cli tool in Node

## Project dependencies

- Any Node.js version >= 14 LTS
- Preferrably a UNIX environment to run this in
    - Powershell users beware, but you should be fine as long as you have a working Node.js installation

## Running `address-verify`

_Note_: These instructions are pre-implementation and are subject to change
When running from the source files, do the following:

1. Choose your JS/TS package manager of choice (npm will be used in the README for simplicity)
2. Run `npm install`
3. Run `npm run build`
4. Run any of the following (easiest first)
    - `npm start`
    - `node dist/index.js`

<!-- TODO - Update with instructions once CLI tooling is in place -->

### Running the tests

Tests can be ran (after performing a package installation as mentioned above) with `npm run test`

## Architecture Notes

### Language & Structure

While writing this in Ruby would be fun, it's been a hot minute -- ergo, I opted for a Typescript Node.js project due to my expertise with the language. My goto package manager is typically `yarn`, but for the sake of this project I went with `npm` due to it's universal bundling with `node` versions.

The code is broken up into a series of classes and patterns that would translate across any language I would write this in.

<!-- TODO - Update with the project breakdown -->

### Testing

For testing I chose `vitest` due to it's simplicity with setting up, built in mocking support, and easy integration with coverage reporting for CI and when running locally. From experience with writing dev tooling, `vitest` pairs nicely with command-line projects and even more so with thoughtfully architected modules. Any Jest-eque substitue would work fine in this project -- what matters most is thorough coverage for all of the use and edge cases.