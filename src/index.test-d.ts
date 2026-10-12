import { describe, expectTypeOf, it } from 'vitest';

import type { Abstract, NoArgument, Type } from './index.js';

class User {
  constructor(public readonly name: string) {}

  greet(): string {
    return `Hello, ${this.name}`;
  }
}

abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(private readonly radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Invoice {
  total = 0;
}

class Singleton {
  static readonly instance = new Singleton(1);

  private constructor(readonly id: number) {}
}

/** A plain function declaration. */
function plainFunction(): void {
  // Not a class.
}

/**
 * Accepts only values assignable to `Type<T>`.
 * @param type - The class to accept.
 * @returns The same class.
 */
function accept<T>(type: Type<T>): Type<T> {
  return type;
}

describe('Type<T>', () => {
  it('accepts a concrete class', () => {
    expectTypeOf(User).toExtend<Type<User>>();
    expectTypeOf(Circle).toExtend<Type<Circle>>();
    expectTypeOf(accept(User)).toEqualTypeOf<Type<User>>();
  });

  it('accepts a concrete subclass where the base instance type is expected', () => {
    expectTypeOf(Circle).toExtend<Type<Shape>>();
  });

  it('infers the instance type produced by new', () => {
    expectTypeOf<InstanceType<Type<User>>>().toEqualTypeOf<User>();
    expectTypeOf(new (accept(User))('Ada')).toEqualTypeOf<User>();
  });

  it('defaults to unknown instances when T is omitted', () => {
    expectTypeOf(User).toExtend<Type>();
    expectTypeOf(Shape).not.toExtend<Type>();
    expectTypeOf<InstanceType<Type>>().toBeUnknown();
  });

  it('rejects an abstract class', () => {
    expectTypeOf(Shape).not.toExtend<Type<Shape>>();
    // @ts-expect-error: abstract classes have no callable constructor.
    accept<Shape>(Shape);
  });

  it('rejects an unrelated class', () => {
    expectTypeOf(Invoice).not.toExtend<Type<User>>();
    // @ts-expect-error: Invoice instances are not User instances.
    accept<User>(Invoice);
  });

  it('rejects a plain object', () => {
    const plain = { prototype: User.prototype };
    const instance = new User('Ada');

    expectTypeOf(plain).not.toExtend<Type<User>>();
    expectTypeOf(instance).not.toExtend<Type<User>>();
    // @ts-expect-error: a plain object has no construct signature.
    accept<User>(plain);
    // @ts-expect-error: an instance is not its class.
    accept<User>(instance);
  });

  it('rejects a plain function', () => {
    expectTypeOf(plainFunction).not.toExtend<Type>();
    expectTypeOf((): User => new User('Ada')).not.toExtend<Type<User>>();
  });

  it('rejects a class with a private constructor', () => {
    expectTypeOf(Singleton).not.toExtend<Type<Singleton>>();
  });
});

/**
 * Accepts only values assignable to `Abstract<T>`.
 * @param token - The class to accept.
 * @returns The same class.
 */
function token<T>(token: Abstract<T>): Abstract<T> {
  return token;
}

describe('Abstract<T>', () => {
  it('accepts an abstract class', () => {
    expectTypeOf(Shape).toExtend<Abstract<Shape>>();
    expectTypeOf(token(Shape)).toEqualTypeOf<Abstract<Shape>>();
  });

  it('accepts a concrete class, including one that implements the base', () => {
    expectTypeOf(User).toExtend<Abstract<User>>();
    expectTypeOf(Circle).toExtend<Abstract<Shape>>();
  });

  it('accepts any Type<T>', () => {
    expectTypeOf<Type<User>>().toExtend<Abstract<User>>();
  });

  it('cannot be constructed', () => {
    type Newable<C> = C extends new (...args: never[]) => unknown
      ? true
      : false;

    expectTypeOf<Newable<Abstract<Shape>>>().toEqualTypeOf<false>();
    expectTypeOf<Type<User>>().toBeConstructibleWith('Ada');
  });

  it('rejects an unrelated class', () => {
    expectTypeOf(Invoice).not.toExtend<Abstract<Shape>>();
    // @ts-expect-error: Invoice instances are not Shape instances.
    token<Shape>(Invoice);
  });

  it('rejects a plain object with a prototype key', () => {
    const plain = { prototype: Shape.prototype };

    expectTypeOf(plain).not.toExtend<Abstract<Shape>>();
    // @ts-expect-error: a plain object is not a class.
    token<Shape>(plain);
  });

  it('rejects a plain function', () => {
    const arrow = (): number => 1;

    expectTypeOf(arrow).not.toExtend<Abstract>();
    expectTypeOf(plainFunction).not.toExtend<Abstract>();
    // @ts-expect-error: an arrow function is not a class.
    token<Shape>(arrow);
  });

  it('rejects a class with a private constructor', () => {
    expectTypeOf(Singleton).not.toExtend<Abstract<Singleton>>();
  });

  it('defaults to unknown instances when T is omitted', () => {
    expectTypeOf(Shape).toExtend<Abstract>();
    expectTypeOf<InstanceType<Abstract>>().toBeUnknown();
  });
});

class Clock {
  now(): Date {
    return new Date();
  }
}

class Counter {
  constructor(readonly start = 0) {}
}

/**
 * Accepts only values assignable to `NoArgument<T>`.
 * @param type - The class to accept.
 * @returns The same class.
 */
function noArgument<T>(type: NoArgument<T>): NoArgument<T> {
  return type;
}

describe('NoArgument<T>', () => {
  it('accepts a class without a constructor', () => {
    expectTypeOf(Clock).toExtend<NoArgument<Clock>>();
    expectTypeOf(noArgument(Clock)).toEqualTypeOf<NoArgument<Clock>>();
  });

  it('accepts a class whose constructor parameters are all optional', () => {
    expectTypeOf(Counter).toExtend<NoArgument<Counter>>();
  });

  it('constructs with no arguments only', () => {
    expectTypeOf<NoArgument<Clock>>().toBeConstructibleWith();
    expectTypeOf<InstanceType<NoArgument<Clock>>>().toEqualTypeOf<Clock>();
    // @ts-expect-error: NoArgument takes no constructor arguments.
    new (noArgument(Clock))('extra');
  });

  it('is both a Type and an Abstract', () => {
    expectTypeOf<NoArgument<Clock>>().toExtend<Type<Clock>>();
    expectTypeOf<NoArgument<Clock>>().toExtend<Abstract<Clock>>();
  });

  it('rejects a class that requires constructor arguments', () => {
    expectTypeOf(User).not.toExtend<NoArgument<User>>();
    expectTypeOf(Circle).not.toExtend<NoArgument<Circle>>();
    // @ts-expect-error: User requires a name.
    noArgument<User>(User);
  });

  it('rejects an abstract class', () => {
    expectTypeOf(Shape).not.toExtend<NoArgument<Shape>>();
    // @ts-expect-error: abstract classes cannot be constructed.
    noArgument<Shape>(Shape);
  });

  it('rejects an unrelated class, a plain function and a plain object', () => {
    expectTypeOf(Invoice).not.toExtend<NoArgument<Clock>>();
    expectTypeOf((): Clock => new Clock()).not.toExtend<NoArgument<Clock>>();
    expectTypeOf(plainFunction).not.toExtend<NoArgument>();
    expectTypeOf({ prototype: Clock.prototype }).not.toExtend<
      NoArgument<Clock>
    >();
  });

  it('rejects a class with a private constructor', () => {
    expectTypeOf(Singleton).not.toExtend<NoArgument<Singleton>>();
  });

  it('defaults to unknown instances when T is omitted', () => {
    expectTypeOf(Clock).toExtend<NoArgument>();
    expectTypeOf<InstanceType<NoArgument>>().toBeUnknown();
  });
});
