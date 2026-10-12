/**
 * A concrete class whose instances are `T`.
 *
 * Accepts any class that can be constructed with `new`. Rejects abstract
 * classes; use {@link Abstract} for those.
 *
 * @typeParam T - The instance type. Defaults to `unknown`.
 *
 * @example
 * ```ts
 * import type { Type } from '@armscye/core';
 *
 * function create<T>(type: Type<T>, ...args: unknown[]): T {
 *   return new type(...args);
 * }
 *
 * create(Date); // Date
 * ```
 */
export type Type<T = unknown> = new (...args: any[]) => T;

/**
 * A class whose instances are `T`, abstract or concrete.
 *
 * Accepts any class but cannot be constructed; use {@link Type} for that.
 *
 * @typeParam T - The instance type. Defaults to `unknown`.
 *
 * @example
 * ```ts
 * import type { Abstract } from '@armscye/core';
 *
 * abstract class Shape {
 *   abstract area(): number;
 * }
 *
 * const token: Abstract<Shape> = Shape;
 * ```
 */
export type Abstract<T = unknown> = abstract new (...args: any[]) => T;

/**
 * A concrete class whose instances are `T`, constructible with no arguments.
 *
 * Accepts classes whose constructor parameters are all optional. Rejects
 * classes that require arguments.
 *
 * @typeParam T - The instance type. Defaults to `unknown`.
 *
 * @example
 * ```ts
 * import type { NoArgument } from '@armscye/core';
 *
 * function instantiate<T>(type: NoArgument<T>): T {
 *   return new type();
 * }
 *
 * instantiate(Date); // Date
 * ```
 */
export type NoArgument<T = unknown> = new () => T;
