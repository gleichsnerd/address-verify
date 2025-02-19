// Mock the core SDK types and functionality
export class StaticCredentials {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(authId: string, authToken: string) {}
}

export class Lookup {
  street: string = '';
  city: string = '';
  zipCode: string = '';
  maxCandidates: number = 1;

  constructor() {}
}

export class Batch<T> {
  private lookups: T[] = [];

  add(lookup: T) {
    this.lookups.push(lookup);
  }

  getLookups() {
    return this.lookups;
  }
}

export class ClientBuilder {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(credentials: StaticCredentials) {}

  buildUsStreetApiClient() {
    return new MockUsStreetApiClient();
  }
}

// Very rough "stringToSmartyLookup" function for wiring up mock lookups
function addressToComponents(address: {
  street: string;
  city: string;
  zipCode: string;
}) {
  // Simple street parsing - this could be enhanced for more complex cases
  const streetParts = address.street.split(' ');
  const primaryNumber = streetParts[0];
  const streetName = streetParts.slice(1, -1).join(' ');
  const streetSuffix = streetParts[streetParts.length - 1];

  return {
    primaryNumber,
    streetName,
    streetSuffix,
    cityName: address.city,
    zipCode: address.zipCode.split('-')[0], // Handle ZIP+4 format
    plus4Code: address.zipCode.split('-')[1] || '', // Extract +4 if present
  };
}

class MockUsStreetApiClient {
  async send(batch: Batch<Lookup>) {
    const lookups = batch.getLookups();

    return {
      lookups: lookups
        .map((lookup) => {
          // Add a killswitch for triggering invalid addresses
          if (lookup.city === 'Invalid') {
            return { result: [] };
          }

          if (lookup.city === 'Error') {
            return undefined;
          }

          const components = addressToComponents({
            street: lookup.street,
            city: lookup.city,
            zipCode: lookup.zipCode,
          });

          // Return a mock standardized address result
          return {
            result: [
              {
                components: {
                  primaryNumber: components.primaryNumber,
                  streetName: components.streetName,
                  streetSuffix: components.streetSuffix,
                  cityName: components.cityName,
                  zipCode: components.zipCode,
                  plus4Code: components.plus4Code,
                },
              },
            ],
          };
        })
        .filter((lookup) => lookup !== undefined),
    };
  }
}

// Export the mock SDK
const SmartySDK = {
  core: {
    ClientBuilder,
    StaticCredentials,
    Batch,
  },
  usStreet: {
    Lookup,
  },
};

vi.mock('smartystreets-javascript-sdk', () => {
  return {
    default: SmartySDK,
  };
});
