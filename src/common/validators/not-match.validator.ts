import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

export function NotMatch(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NotMatchValidator,
    });
  };
}

@ValidatorConstraint({ name: 'notMatch' })
export class NotMatchValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value !== relatedValue;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const [relatedPropertyName] = validationArguments.constraints;
    return `${validationArguments.property} must not match ${relatedPropertyName}`;
  }
}
