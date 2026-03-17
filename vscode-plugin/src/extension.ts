import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const terminal = vscode.window.createTerminal('Fair');
  
  const runReview = vscode.commands.registerCommand('fair.run', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showInformationMessage('No file open'); return; }
    
    const filePath = editor.document.uri.fsPath;
    const config = vscode.workspace.getConfiguration('fair');
    const severity = config.get('severity', 'warning');
    const aiEnabled = config.get('aiEnabled', false);
    
    let cmd = `npx fair "${filePath}" -s ${severity}`;
    if (aiEnabled) cmd += ' --ai';
    
    terminal.sendText(cmd);
    terminal.show();
  });

  // Auto run on save
  const config = vscode.workspace.getConfiguration('fair');
  if (config.get('enableOnSave', true)) {
    vscode.workspace.onDidSaveTextDocument(() => {
      vscode.commands.executeCommand('fair.run');
    });
  }

  context.subscriptions.push(runReview);
}

export function deactivate() {}
