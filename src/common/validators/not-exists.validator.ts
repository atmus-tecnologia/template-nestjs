import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

export function NotExists(entity: any, column: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entity, column],
      validator: NotExistsValidator,
    });
  };
}

@ValidatorConstraint({ name: 'notExists', async: true })
export class NotExistsValidator implements ValidatorConstraintInterface {
  async validate(value: string | number, args: ValidationArguments) {
    const [entity, column] = args.constraints;

    try {
      const result = await entity.countBy({ [column]: value });
      return result;
    } catch (error) {
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [entity, column] = args.constraints;
    return `${column} with value ${args.value} not exists in ${entity.name}`;
  }
}
