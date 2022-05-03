export interface IValidator<T = any> {
  // validator name
  name: string;
  // validate Schema format
  validateSchema(args: T): boolean;
  // validate input data
  validateData(data: string, args: T): boolean;
}
