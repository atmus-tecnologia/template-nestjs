import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Not } from 'typeorm';

export function Exists(entity: any, column: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entity, column],
      validator: ExistsValidator,
    });
  };
}

@ValidatorConstraint({ name: 'exists', async: true })
export class ExistsValidator implements ValidatorConstraintInterface {
  async validate(value: string | number, args: ValidationArguments) {
    const [entity, column] = args.constraints;

    // Search condition
    const where = { [column]: value };

    // Checks if the object id exists, if it does, add the condition of not being the object id
    const { id } = args.object as any;
    if (id) Object.assign(where, { id: Not(id) });

    try {
      const result = await entity.countBy(where);
      return !result;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [, column] = args.constraints;
    return `${column} with value ${args.value} already exists`;
  }
}
