export default interface IValidator<T = any> {
  // validator name
  readonly name: string;
  // validate Schema format
  validateSchema(args: T): boolean;
  // validate input value
  validateData(value: string, args: T): boolean;
}
