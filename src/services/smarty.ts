import SmartySDK from 'smartystreets-javascript-sdk';
import { getSmartyAuthId, getSmartyAuthToken } from '../utilities/env.js';

type SmartyClient = ReturnType<
  SmartySDK.core.ClientBuilder<unknown, unknown>['buildUsStreetApiClient']
>;
type Lookup = SmartySDK.usStreet.Lookup;

export type Address = {
  street: string;
  city: string;
  zipCode: string | number;
};

// Developer's Note: We'll treat all values as potentially undefined since we can't
// guarantee Smarty will always return all values we expect
export type SmartyLookup = {
  components: {
    urbanization?: string;
    primaryNumber?: string;
    streetName?: string;
    streetPredirection?: string;
    streetPostdirection?: string;
    streetSuffix?: string;
    cityName?: string;
    state?: string;
    zipCode?: string;
    plus4Code?: string;
  };
};

export type SmartyLookupResult = {
  result: SmartyLookup[];
};

type SmartyBatchLookupResult = {
  lookups: SmartyLookupResult[];
};

export type ValidationResult =
  | { valid: true; address: Address; originalAddress: Address }
  | { valid: false; originalAddress: Address };

/**
 * SmartyService: Wrapper service for the SmartyStreets SDK
 *
 * Developer's Note: While we could also directly use the API via REST calls,
 * I opted for using the SDK to reduce boilerplate with handling requests and responses.
 */
class SmartyService {
  private smarty: null | SmartyClient = null;
  constructor() {
    if (!SmartyService.validateEnvironment()) {
      throw new Error('Missing required environment variables');
    }

    // Developer's Note: Hositing the breakdown of the SDK mucks with mocking
    const SmartyCore = SmartySDK.core;
    const smartyAuthId = getSmartyAuthId();
    const smartyAuthToken = getSmartyAuthToken();
    const clientBuilder = new SmartyCore.ClientBuilder(
      new SmartyCore.StaticCredentials(smartyAuthId!, smartyAuthToken!),
    );
    this.smarty = clientBuilder.buildUsStreetApiClient();
  }

  public static validateEnvironment(): boolean {
    const smartyAuthId = getSmartyAuthId();
    const smartyAuthToken = getSmartyAuthToken();
    return (
      !!smartyAuthId &&
      smartyAuthId.length > 0 &&
      !!smartyAuthToken &&
      smartyAuthToken.length > 0
    );
  }

  public addressToLookup(address: Address): Lookup {
    const lookup = new SmartySDK.usStreet.Lookup();
    lookup.street = address.street;
    lookup.city = address.city;
    lookup.zipCode = `${address.zipCode}`;
    // Developer's Note: For now we will only take the best candidate
    lookup.maxCandidates = 1;
    return lookup;
  }

  public formatStreet(lookup: SmartyLookup): string {
    const components = lookup.components;
    const parts = [
      components.primaryNumber ?? '',
      components.streetPredirection ?? '',
      components.streetName ?? '',
      components.streetSuffix ?? '',
      components.streetPostdirection ?? '',
    ];

    return parts
      .filter((part) => part.length > 0)
      .join(' ')
      .trim();
  }

  public formatCity(lookup: SmartyLookup): string {
    const components = lookup.components;
    const parts = [components.cityName ?? ''];

    return parts
      .filter((p) => p.length > 0)
      .join(' ')
      .trim();
  }

  public formatZipCode(lookup: SmartyLookup): string {
    const components = lookup.components;
    const parts = [components.zipCode ?? '', components.plus4Code ?? ''].filter(
      (part) => part.length > 0,
    );

    return parts.join('-').trim();
  }

  public smartyLookupToAddress(lookup: SmartyLookup): Address {
    return {
      street: this.formatStreet(lookup),
      city: this.formatCity(lookup),
      zipCode: this.formatZipCode(lookup),
    };
  }

  public async validateAddresses(
    addresses: Address[],
  ): Promise<ValidationResult[]> {
    const SmartyCore = SmartySDK.core;
    if (!this.smarty) {
      throw new Error('Smarty client not initialized');
    }

    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < addresses.length; i += batchSize) {
      batches.push(addresses.slice(i, i + batchSize));
    }

    const results: ValidationResult[] = [];
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      /*
       * Developer's Note:
       * While we could do pre-validation of addresses to automatically flag ones with missing fields as invalid,
       * for the sake of this iteration I want to defer to Smarty for all validation. Future work could include
       * said pre-validation to reduce the number of requests to Smarty or flag for various business cases.
       */
      const lookups = batch.map((address) => this.addressToLookup(address));
      const batchLookup = new SmartyCore.Batch<Lookup>();
      lookups.forEach((lookup) => batchLookup.add(lookup));

      try {
        // Developer's Note: We are casting the response to a more workable type since Smarty doesn't provide their
        // own types and the @types definition is a bit convoluted and incorrect at times
        const response = (await this.smarty.send(
          batchLookup,
        )) as unknown as SmartyBatchLookupResult;

        if (!response.lookups || response.lookups.length !== batch.length) {
          throw new Error('Missing results from Smarty');
        }

        for (
          let lookupIndex = 0;
          lookupIndex < response.lookups.length;
          lookupIndex++
        ) {
          const lookupResult = response.lookups[lookupIndex];
          const originalAddressIndex = batchIndex * batchSize + lookupIndex;
          const originalAddress = addresses[originalAddressIndex];
          if (
            lookupResult.result?.length === 0 ||
            lookupResult.result[0]?.components === undefined
          ) {
            results.push({ valid: false, originalAddress });
          } else {
            // Pick the best match from Smarty
            const bestMatch = lookupResult.result[0];
            const address = this.smartyLookupToAddress(bestMatch);
            results.push({ valid: true, address, originalAddress });
          }
        }
      } catch (error) {
        const e = error as Error;
        // Developer's note: For now we'll treat any Smarty error as fatal
        throw new Error(`Error validating addresses: ${e.message}`, e);
      }
    }

    return results;
  }

  public async validateAddress(address: Address): Promise<ValidationResult> {
    const response = await this.validateAddresses([address]);
    // If there's no response, we would have already thrown
    return response[0];
  }
}

export default SmartyService;
