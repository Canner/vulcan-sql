export default interface IValidator<T = any> {
  // validator name
  readonly name: string;
  // validate Schema format
  validateSchema(args: T): void;
  // validate input value
  validateData(value: string, args?: T): void;
}
