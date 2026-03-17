import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('fair');
    const enabled = config.get<boolean>('enable', true);
    
    if (!enabled) {
        return;
    }
    
    diagnosticCollection = vscode.languages.createDiagnosticCollection('fair');
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('fair.run', runFair),
        vscode.commands.registerCommand('fair.runOnFolder', runFairOnFolder)
    );
    
    // Run on save
    vscode.workspace.onDidSaveTextDocument((document) => {
        if (isSupported(document.languageId)) {
            runFairForFile(document.uri.fsPath);
        }
    });
    
    // Run on open
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (isSupported(document.languageId)) {
            runFairForFile(document.uri.fsPath);
        }
    });
    
    console.log('Frontend AI Review extension activated');
}

function isSupported(languageId: string): boolean {
    return ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue', 'svelte'].includes(languageId);
}

async function runFair() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder found');
        return;
    }
    
    await runFairInFolder(workspaceFolder.uri.fsPath);
}

async function runFairOnFolder() {
    const uri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false
    });
    
    if (uri?.[0]) {
        await runFairInFolder(uri[0].fsPath);
    }
}

async function runFairInFolder(folderPath: string) {
    const config = vscode.workspace.getConfiguration('fair');
    const severity = config.get<string>('severity', 'warning');
    const categories = config.get<string[]>('categories', ['react', 'vue', 'typescript', 'security', 'performance', 'best-practice']);
    const enableAI = config.get<boolean>('enableAI', false);
    const aiModel = config.get<string>('aiModel', 'gpt-4o-mini');
    
    const args = [
        folderPath,
        '--severity', severity,
        '--category', categories.join(','),
        '--output', 'json'
    ];
    
    if (enableAI) {
        args.push('--ai');
        args.push('--ai-model', aiModel);
    }
    
    const cmd = `fair ${args.join(' ')}`;
    
    vscode.window.showInformationMessage('Running Frontend AI Review...');
    
    exec(cmd, { cwd: folderPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Fair error: ${error.message}`);
            return;
        }
        
        try {
            const results = JSON.parse(stdout);
            displayResults(results, folderPath);
            vscode.window.showInformationMessage(`Fair found ${results.summary?.filesWithIssues || 0} files with issues`);
        } catch (e) {
            vscode.window.showWarningMessage('Failed to parse Fair output');
        }
    });
}

async function runFairForFile(filePath: string) {
    const config = vscode.workspace.getConfiguration('fair');
    const severity = config.get<string>('severity', 'warning');
    const folder = path.dirname(filePath);
    
    const cmd = `fair "${folder}" --severity ${severity} --output json`;
    
    exec(cmd, { cwd: folder }, (error, stdout) => {
        if (error) return;
        
        try {
            const results = JSON.parse(stdout);
            displayResults(results, folder);
        } catch (e) {
            // Ignore parse errors
        }
    });
}

function displayResults(results: any, folderPath: string) {
    diagnosticCollection.clear();
    
    const diagnostics = new Map<string, vscode.Diagnostic[]>();
    
    for (const result of results.results || []) {
        const filePath = path.join(folderPath, result.file);
        
        for (const issue of result.issues || []) {
            const range = new vscode.Range(
                issue.location.start.line - 1,
                issue.location.start.column || 0,
                issue.location.end?.line - 1 || issue.location.start.line - 1,
                issue.location.end?.column || 100
            );
            
            const severity = issue.severity === 'error' 
                ? vscode.DiagnosticSeverity.Error 
                : issue.severity === 'warning'
                    ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Information;
            
            const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
            diagnostic.code = issue.ruleId;
            
            const existing = diagnostics.get(filePath) || [];
            existing.push(diagnostic);
            diagnostics.set(filePath, existing);
        }
    }
    
    for (const [file, diags] of diagnostics) {
        const uri = vscode.Uri.file(file);
        diagnosticCollection.set(uri, diags);
    }
}

export function deactivate() {
    diagnosticCollection?.dispose();
}
