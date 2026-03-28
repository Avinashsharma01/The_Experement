# 4) Debug, Test, Package, and Publish

## Debugging basics

- Open `src/extension.ts`
- Set breakpoints
- Press `F5`
- Trigger your command from Command Palette in the development host

Use the Debug Console and Variables panel to inspect runtime behavior.

## Testing basics

Generated projects can include extension test setup. Common commands:

```bash
npm run compile
npm run lint
npm test
```

If tests are missing, you can start with manual tests in Extension Development Host.

## Package as `.vsix`

Install packaging tool once:

```bash
npm install -g @vscode/vsce
```

From extension root:

```bash
vsce package
```

This produces a `.vsix` file you can install locally.

## Install `.vsix` locally

In VS Code:

1. Open Extensions panel
2. Click `...` menu
3. Choose **Install from VSIX...**
4. Select your packaged file

## Publish to Marketplace (high level)

1. Create a publisher account on Visual Studio Marketplace
2. Create a Personal Access Token (PAT)
3. Login using:

```bash
vsce login <publisher-name>
```

4. Publish:

```bash
vsce publish
```

## Good practices before publish

- Clear README with usage and screenshots
- Changelog updates
- Semantic versioning (`major.minor.patch`)
- Verify activation events are minimal
- Avoid blocking operations during activation
