# 3) Build Your First Extension

This file walks you through creating a simple command extension.

## Step 1: Scaffold extension project

```bash
yo code
```

Recommended answers:

- **What type of extension?** New Extension (TypeScript)
- **Name**: hello-extension (or your choice)
- **Identifier**: hello-extension
- **Initialize a git repository?** Yes

Then open that generated folder in VS Code.

## Step 2: Understand generated code

The generator creates:

- `src/extension.ts` with `activate()` and `deactivate()`
- A sample command registration
- `package.json` with command contribution

## Step 3: Add your own command

In `src/extension.ts`, keep a command like this (or similar):

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('hello-extension.helloWorld', () => {
    vscode.window.showInformationMessage('Hello from your first VS Code extension!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
```

## Step 4: Match command id in `package.json`

Make sure command contribution includes the same command id:

```json
"contributes": {
  "commands": [
    {
      "command": "hello-extension.helloWorld",
      "title": "Hello World"
    }
  ]
}
```

## Step 5: Run extension

- Press `F5` in VS Code.
- A new **Extension Development Host** window opens.
- Press `Ctrl+Shift+P` and run: `Hello World`.
- You should see your information message.

## If command does not appear

Check these quickly:

- `npm install` completed in project folder
- TypeScript build has no errors
- command id in `extension.ts` and `package.json` is exactly the same
