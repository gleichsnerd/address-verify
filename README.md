# `address-verify`

A nicely robust implementation of an address verification cli tool in Node

## Quick Install

Got Node.js already installed? Want to try this out in lightning speed? Here's all you need to do!

1. Make sure you have `SMARTY_AUTH_ID` and `SMARTY_AUTH_TOKEN` set as environment variables
2. Run `npm run setup`

- We need sudo permissions to make a global symlink, so don't be alarmed if it asks for elevated permissions

3. Now you can run `address-verify` anywhere, like so

- `cat your-data.csv | address-verify`
- `address-verify path/to/your/data.csv`

## Project Dependencies

- Any Node.js version >= 18 LTS
  - Why 18? It's the easiest to install out the gate on Apple Silicon, and I don't want to make anyone have to debug installing node :)
- Preferrably a UNIX environment to run this in
  - Powershell users beware, but you should be fine as long as you have a working Node.js installation
- `SMARTY_AUTH_ID` and `SMARTY_AUTH_TOKEN` defined as environment variables with your valid Smarty auth id & token

## Running `address-verify`

_If you don't want to use the quick install method, here's how you can build and run from source_

When running from the source files, do the following:

1. Choose your JS/TS package manager of choice (npm will be used in the README for simplicity)
2. Run `npm install`
3. Run `npm run build`
4. Run any of the following (easiest first)
   - `npm run start <filename>`
   - `cat <filename> | npm run start`
   - `node dist/index.js <filename>`
   - `cat <filename> | node dist/index.js`

### Running the Tests

Tests can be ran (after performing a package installation as mentioned above) with `npm run test`. Coverage can be ran with `npm run test:coverage`.

### Linting & Formatting

Lint and formatting rules have been selected from typical industry standards and are enforced on PRs. You can run them manually with `npm run lint` and fix any errors with `npm run lint:fix`.

## Architecture Notes

### Business Assumptions

For this project I made a couple business assumptions along the way:

1. Partial addressess (eg missing city or zip) would still be sent to be validated because Smarty supports this and does a pretty good job at managing it
2. If we encounter API failures, abort the program wrather than potentially marking valid addresses as invalid

### Language, Frameworks, & Structure

While writing this in Ruby would be fun, it's been a hot minute -- ergo, I opted for a Typescript Node.js project due to my expertise with the language. My goto package manager is typically `yarn`, but for the sake of this project I went with `npm` due to it's universal bundling with `node` versions.

The primary frameworks used are `Yargs` for command line processing, `fast-csv` to make csv file parsing a bit easier, and `smartystreets-javascript-sdk` for interacting with the Smarty API (direct REST calls are also a valid approach but come with extra boilerplate).

The code is broken up into a series of classes and patterns that would translate across any language I would write this in:

#### `commands`

I abstracted around `Yargs` to make a command-per-file structure that contains any argument processing and handler routing. New commands can be easily added by extending the `BaseCommand` and specifying the command name and handler code. Each command gets registered with a `CommandRouter` which parses the commands and registers them with `Yargs`.

#### `parsers`

These are handlers for all of our dataprocessing needs. Because we need to handle both file-based and piped-in data, parsers are structured around the format of the data (eg comma separated, pipe separated, json, etc). From the `RowParser` base class which holds our schema validation logic, we can extend it to `CSVParser` to handle comma separated files and pipe data, and then extend it further to `AddressParser` to enforce our specific address schema. Adding new row-based parsers would follow the same approach as `CSVParser` while adding new schemas would follow how we did `AddressParser`.

#### `services`

For our services, I wanted to contain all of our Smarty SDK code in its own `SmartyService` -- if we wanted to change our implementation (eg using the API directly) or add different validator types besides usStreet, this would be where we would do it. It also allows us to mock the parts of the Smarty SDK that we use with a reusible mock factory that we utilize in a large swath of our tests.

To handle any potential scenarios where we would have to integrate with a different service or add additional services to our address validation pipeline, we also have an `AddressService` that accepts data from our parsers and handles the conversion and routing through our additional services.

### Testing

For testing I chose `vitest` due to it's simplicity with setting up, built in mocking support, and easy integration with coverage reporting for CI and when running locally. From experience with writing dev tooling, `vitest` pairs nicely with command-line projects and even more so with thoughtfully architected modules. Any Jest-eque substitue would work fine in this project -- what matters most is thorough coverage for all of the use and edge cases.

Coverage for this project ended up around 98% where the only missing lines are either boilerplate code for Yargs or extra safety catches that aren't able to be hit during execution but are required for type safety with Typescript.

Mocking is primarily used around `Yargs` to enable some base class testing and the Smarty SDK so that we can run tests without burning our trial allowance.

### Linting, Formatting, and Enforcement

Skipping any soapboxes or eternal debates, I picked standard rules for ESLint and Prettier for this repo and wired them up into the CI process for enforcement. Normally I would suggest commit hooks using `husky` for this, but having seen many a Windows dev environment blow up from weird `husky` behavior, I opted to just rely on the PR phase of changes to enforce these rules.
