import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "practice-2" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('extension.showAnimeInformation', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('捏造トラップは最高');
	});

	const provider1 = vscode.languages.registerCompletionItemProvider('perl', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			// a simple completion item which inserts `Hello World!`
			const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const commitCharacterCompletion = new vscode.CompletionItem('console');
			commitCharacterCompletion.commitCharacters = ['.'];
			commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after 
			// completion has been inserted. Also, the `insertText` is set so that 
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				simpleCompletion,
				new vscode.CompletionItem('Hello Hello Hello'),
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'perl',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	const autoUse = vscode.languages.registerCompletionItemProvider(
		'perl',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

				const line = document.lineAt(position).text.substr(0, position.character);
				const word = (() => {
					const words = line.split(' ');
					return words[words.length - 1];
				})();

				const matches = word.match(/^(((\w+(::|'))*)\w+)$/);
				if (matches === null) {
					return undefined;
				}

				const perlCode = 'use v5.10;'
					+ 'use strict;'
					+ 'use warnings;'
					+ 'use Module::Load qw( load );'
					+ 'my $module = $ARGV[0];'
					+ 'eval { load $module };'
					+ 'print do { if ($@) {'
						+ "no strict q{refs};"
						+ '!!scalar(%{ qq!${module}::! });'
					+ '}'
					+ 'else {'
						+ '1;'
				  	+ '}'
					+ '}';

				let isLoadableModule = false;
				exec(`perl -e '${perlCode}' ${word}`, (error, stdout, _stderr) => {
					if (error !== null) {
						console.log(error);
					} else {
						if (stdout === '1') {
							isLoadableModule = true;
						}
					}
				});

				const commitCharacterCompletion = new vscode.CompletionItem('Auto use');
				commitCharacterCompletion.commitCharacters = ['-'];

				return [
					commitCharacterCompletion,
				];
			}
		},
	);

	context.subscriptions.push(disposable, provider1, provider2, autoUse);
}

// this method is called when your extension is deactivated
export function deactivate() {}
