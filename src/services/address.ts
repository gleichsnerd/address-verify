import { AddressRow } from '../parsers/address-parser.js';
import SmartyService, { Address, ValidationResult } from './smarty.js';

class AddressService {
  public addressRowToAddress(row: AddressRow): Address {
    return {
      street: row['Street'],
      city: row['City'],
      zipCode: row['Zip Code'],
    };
  }
  public async validate(rows: AddressRow[]): Promise<ValidationResult[]> {
    const smartyService = new SmartyService();
    const results = await smartyService.validateAddresses(
      rows.map(this.addressRowToAddress),
    );
    return results;
  }
  public static addressToString(address: Address): string {
    return `${address.street}, ${address.city}, ${address.zipCode}`;
  }
}

export default AddressService;
