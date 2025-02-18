export interface BaseRow {
  [key: string]: unknown;
}

/**
 * RowParser: An abstract base class for parsing row based data from file or pipe.
 * It defines our parsing interface and holds universal logic like schema validation,
 * regardless of where we get the data from.
 */
abstract class RowParser<Row extends BaseRow = BaseRow> {
  protected schema: string[] = [];

  public validateSchema(row: Row): boolean {
    // If we have no schema to enforce, then assume any field is allowed
    if (this.schema.length === 0) {
      return true;
    }

    const keys = Object.keys(row) as typeof this.schema;

    // Future improvements: Allow configuring whether we want strict schema versus minimum schema,
    // as well as enforcing value types.
    const hasOnlySchemaKeys = keys.every((key) => this.schema.includes(key));
    const hasAllSchemaKeys = this.schema.every((key) => keys.includes(key));
    return hasOnlySchemaKeys && hasAllSchemaKeys;
  }
}

export default RowParser;
