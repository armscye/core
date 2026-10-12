# @armscye/core

> A collection of shared TypeScript types - classes, constructors, and more.

## Install

```sh
npm install --save-dev @armscye/core
# or
yarn add --dev @armscye/core
# or
pnpm add -D @armscye/core
```

Import with `import type { … }` so the import is erased from your build.

The package is ESM only. In a CommonJS file compiled with
`"module": "node16"`, add the `resolution-mode` attribute; with
`"module": "nodenext"` (TypeScript 5.8+) the plain form works.

```ts
import type { Type } from '@armscye/core' with {
  'resolution-mode': 'import',
};
```

> [!NOTE]
> Install it as a regular dependency instead if your package publishes
> `.d.ts` files that reference these types, or if you use inline
> `import { type … }` with `verbatimModuleSyntax`, which keeps an
> `import {} from '@armscye/core'` at runtime.

## Usage

```ts
import type { Abstract, NoArgument, Type } from '@armscye/core';
```

| Type            | Accepts                                     | `new` allowed      |
| --------------- | ------------------------------------------- | ------------------ |
| `Type<T>`       | Concrete classes                            | With any arguments |
| `Abstract<T>`   | Abstract and concrete classes               | No                 |
| `NoArgument<T>` | Concrete classes with no required arguments | With no arguments  |

All three reject plain functions, plain objects and classes whose instances
are not `T`. `T` defaults to `unknown`.

### `Type<T>`

A concrete class whose instances are `T`.

```ts
abstract class Shape {
  abstract area(): number;
}

function create<T>(type: Type<T>, ...args: unknown[]): T {
  return new type(...args);
}

create(Date); // ✅ Date
create(Shape); // ❌ abstract class
```

### `Abstract<T>`

A class whose instances are `T`, abstract or concrete. It cannot be
constructed.

```ts
abstract class Shape {
  abstract area(): number;
}

const token: Abstract<Shape> = Shape; // ✅
new token(); // ❌ cannot construct an abstract class
```

### `NoArgument<T>`

A concrete class whose instances are `T`, constructible with no arguments.

```ts
function instantiate<T>(type: NoArgument<T>): T {
  return new type();
}

instantiate(Date); // ✅ Date
instantiate(URL); // ❌ URL requires an argument
```

## Contributing

Develop on the Node.js version in `.nvmrc` (`nvm use`, currently 24) and
pnpm via Corepack or a global install matching `packageManager` in
`package.json`. CI also runs every check on Node.js 20.19, the oldest
version the package supports.

```sh
pnpm install     # also installs the Git hooks
pnpm lint        # ESLint (type-checked rules + JSDoc)
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest type tests (src/**/*.test-d.ts)
pnpm build       # emit dist/
pnpm format      # Prettier
```

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `build`             | Cleans and compiles `src/` to `dist/`       |
| `clean`             | Removes `dist/`                             |
| `typecheck`         | Type-checks sources, tests and config files |
| `lint` / `lint:fix` | Runs ESLint, optionally fixing what it can  |
| `format`            | Formats every file with Prettier            |
| `format:check`      | Fails if any file is not formatted          |
| `test`              | Runs the type tests                         |
| `check:package`     | Builds, then runs publint and attw          |
| `release`           | Cuts a release with release-it              |
| `prepack`           | Builds before `npm pack` or `npm publish`   |
| `renovate:validate` | Validates `renovate.json` (Node.js 24+)     |
| `prepare`           | Installs the Husky Git hooks                |

Every exported declaration needs JSDoc with a description; exported
interfaces and type aliases also need an `@example`. `any` is only allowed
in rest parameters such as `...args: any[]`, which constructor types need.

### Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
and are checked by commitlint in the `commit-msg` hook. The `pre-commit` hook
runs ESLint and Prettier on staged files.

```text
feat: add Abstract<T> type        → minor release
fix: correct Type<T> JSDoc        → patch release
feat!: drop Node.js 20 support    → major release
docs: clarify usage               → no version bump on its own
chore(deps): update vitest to v5  → no version bump on its own
```

Renovate opens its PRs as `chore(deps): …`, so dependency updates never
appear in the changelog.

## License

This project is licensed under the **MIT license**.

See [LICENSE](./LICENSE) for more information.
