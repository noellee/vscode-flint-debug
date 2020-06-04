'use strict';

import * as vscode from 'vscode';
import { DebugSession, ProviderResult } from 'vscode';

const output = vscode.window.createOutputChannel('Flint Debug');

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.commands.registerCommand('extension.flint-debug.getTransactionHash', () => {
        return vscode.window.showInputBox({
            prompt: 'Please enter the transaction hash to debug.',
            placeHolder: '0x12345...',
        });
    }));

    const factory = new DebugAdapterExecutableFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('flint', factory));
    if ('dispose' in factory) {
        context.subscriptions.push(factory);
    }
}

export function deactivate(): void {
    // nothing to do
}

class DebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session: DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        const config = vscode.workspace.getConfiguration('flint-debug');
        const command = config.executable;
        let args: string[] = []
        if (config.logging.enable) {
            args = args.concat(
                '--log-file', config.logging.logFilePath,
                '--log-level', config.logging.logLevel,
            );
        }
        args = args.concat('--rpc-url', session.configuration.rpcUrl);
        output.appendLine('Begin debugging...');
        output.appendLine(`Transaction: ${session.configuration.txHash}`);
        output.appendLine(`${command} ${args.join(' ')}`);
        return new vscode.DebugAdapterExecutable(command, args);
    }
}
