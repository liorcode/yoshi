# eslint base configuration for yoshi based projects

## linting guidelines

- **Autofixable** - We try to use mostly autofixable rules, so lint won't be much of a hassle
- **Strict & balanced** - Add non-fixable rules only if they will help to find bugs

## Installation

Install all peer dependencies:

```
  "eslint": "^5.0.0",
  "prettier": "^2.0.5",
  "babel-eslint": "^8.2.2",
  "eslint-plugin-prettier": "^2.6.0"
```

Add the following to your `package.json`:

```json
{
  "eslintConfig": {
    "extends": "yoshi-base"
  }
}
```
