# 1) What is a VS Code Extension?

A **VS Code extension** adds features to Visual Studio Code.

## Examples of extension features

- New commands (shown in Command Palette)
- Custom views and panels
- Language support (syntax highlighting, snippets)
- Linters, formatters, or code actions
- AI or automation workflows

## Core concepts

- **Extension Host**: A Node.js process where your extension code runs.
- **`package.json`**: Declares extension metadata, activation events, and contributions.
- **`extension.ts` / `extension.js`**: Main entry where activation logic lives.
- **Activation Event**: Tells VS Code when to load your extension (for example: when a command runs).

## Typical folder structure

```text
my-extension/
  ├─ package.json
  ├─ tsconfig.json
  ├─ src/
  │   └─ extension.ts
  └─ README.md
```

## Development lifecycle

1. Create project scaffold
2. Add commands/features
3. Run in Extension Development Host
4. Debug and test
5. Package as `.vsix`
6. Publish to VS Code Marketplace
