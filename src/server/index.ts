import {
    createConnection,
    TextDocuments,
    ProposedFeatures
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getLanguageService as getHTMLLanguageService } from "vscode-html-languageservice";
import { getCSSLanguageService } from "vscode-css-languageservice";

import TypeScriptLanguageService from "../TypeScriptLanguageService";

import onCompletion from "./onCompletion";
import onCompletionResolve from "./onCompletionResolve";
import onDefinition from "./onDefinition";
import onDidDocumentChangeContent from "./onDidDocumentChangeContent";
import onDidDocumentClose from "./onDidDocumentClose";
import onGetContentTypeAtCursor from "./onGetContentTypeAtCursor";
import onHover from "./onHover";
import onInitialize from "./onInitialize";
import onLogCompiledComponent from "./onLogCompiledComponent";
import onLogContentTypeAtCursor from "./onLogContentTypeAtCursor";
import onLogDeclaration from "./onLogDeclaration";
import onLogProgramFiles from "./onLogProgramFiles";
import onLogScriptContent from "./onLogScriptContent";
import onLogTypeAtCursor from "./onLogTypeAtCursor";
import onShutdown from "./onShutdown";
import RiotDeclarationDocumentsHandler from "./RiotDeclarationDocumentsHandler";

import { setState } from "./state";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

setState({
    connection,
    documents,

    tsLanguageService: new TypeScriptLanguageService({
        documentsHandlers: [
            RiotDeclarationDocumentsHandler
        ]
    }),
    htmlLanguageService: getHTMLLanguageService(),
    cssLanguageService: getCSSLanguageService(),

    hasConfigurationCapability: false,
    hasWorkspaceFolderCapability: false,
    hasDiagnosticRelatedInformationCapability: false
});

connection.onInitialize(onInitialize);

documents.onDidChangeContent(onDidDocumentChangeContent);
documents.onDidClose(onDidDocumentClose);

connection.onCompletion(onCompletion);

connection.onCompletionResolve(onCompletionResolve);

connection.onHover(onHover);

connection.onDefinition(onDefinition);

connection.onRequest(
    "custom/getContentTypeAtCursor",
    onGetContentTypeAtCursor
);
connection.onRequest(
    "custom/logCompiledComponent",
    onLogCompiledComponent
);
connection.onRequest(
    "custom/logContentTypeAtCursor",
    onLogContentTypeAtCursor
);
connection.onRequest(
    "custom/logDeclaration",
    onLogDeclaration
);
connection.onRequest(
    "custom/logProgramFiles",
    onLogProgramFiles
);
connection.onRequest(
    "custom/logScriptContent",
    onLogScriptContent
);
connection.onRequest(
    "custom/logTypeAtCursor",
    onLogTypeAtCursor
);

connection.onShutdown(onShutdown);

documents.listen(connection);
connection.listen();