# ESLint Compatibility Notes

## Current Status

- **ESLint Version**: 9.7.0
- **eslint-plugin-react**: 7.37.5

## ESLint 10 Compatibility

⚠️ **IMPORTANT**: `eslint-plugin-react` does not yet support ESLint 10.x

The current version of `eslint-plugin-react` (7.37.5) only supports ESLint versions up to `^9.7` according to its peer dependencies:

```json
{
  "eslint": "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7"
}
```

### Why ESLint 10 is not supported

ESLint 10.0 introduced breaking changes to the plugin API, specifically:

- The `contextOrFilename.getFilename()` function was removed/changed
- Other internal API modifications that affect plugin functionality

### Future Upgrade Path

When `eslint-plugin-react` releases a version compatible with ESLint 10, we can upgrade by:

1. Updating `eslint` to the latest 10.x version
2. Updating `eslint-plugin-react` to the compatible version
3. Testing all linting rules work correctly

### Workarounds if ESLint 10 is required

- Disable the problematic `react/display-name` rule temporarily
- Use a fork of eslint-plugin-react with ESLint 10 support
- Wait for official support from the eslint-plugin-react team

### Related Issues

- GitHub issues tracking ESLint 10 support in eslint-plugin-react
- CI/CD pipelines should pin ESLint to 9.x until compatibility is resolved
