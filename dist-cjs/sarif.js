"use strict";
// SARIF output formatter for Frontend AI Review
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputSarif = outputSarif;
exports.writeSarifFile = writeSarifFile;
const index_js_1 = require("./utils/index.js");
/**
 * SARIF (Static Analysis Results Interchange Format) output
 * https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */
function outputSarif(results, projectPath, options = {}) {
    // Convert issues to SARIF format
    const resultsList = [];
    for (const result of results) {
        if (result.issues.length === 0)
            continue;
        const filePath = (0, index_js_1.getRelativePath)(result.file, projectPath);
        for (const issue of result.issues) {
            resultsList.push({
                ruleId: issue.ruleId,
                level: mapSeverityToSarif(issue.severity),
                message: {
                    text: issue.message
                },
                locations: [{
                        physicalLocation: {
                            artifactLocation: {
                                uri: filePath,
                                uriBaseId: 'SRCROOT'
                            },
                            region: {
                                startLine: issue.location.start.line,
                                startColumn: issue.location.start.column || 1,
                                endLine: issue.location.end?.line || issue.location.start.line,
                                endColumn: issue.location.end?.column || 1
                            }
                        }
                    }]
            });
        }
    }
    // Build SARIF document
    const sarif = {
        version: '2.1.0',
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        runs: [
            {
                tool: {
                    driver: {
                        name: 'Frontend AI Review',
                        version: '2.2.0',
                        informationUri: 'https://github.com/Yulingsong/frontend-ai-review',
                        rules: getUniqueRules(results)
                    }
                },
                results: resultsList
            }
        ]
    };
    // Add repository information if provided
    if (options.repoUri) {
        const runs = sarif.runs;
        runs[0].versionControlDetails = [{
                repositoryUri: options.repoUri,
                revisionId: options.commitSha || 'HEAD'
            }];
    }
    return JSON.stringify(sarif, null, 2);
}
/**
 * Map severity to SARIF level
 */
function mapSeverityToSarif(severity) {
    switch (severity) {
        case 'error': return 'error';
        case 'warning': return 'warning';
        default: return 'note';
    }
}
/**
 * Extract unique rules from results
 */
function getUniqueRules(results) {
    const ruleSet = new Map();
    for (const result of results) {
        for (const issue of result.issues) {
            if (!ruleSet.has(issue.ruleId)) {
                ruleSet.set(issue.ruleId, {
                    id: issue.ruleId,
                    name: issue.ruleId,
                    shortDescription: {
                        text: issue.message
                    },
                    defaultConfiguration: {
                        level: mapSeverityToSarif(issue.severity)
                    }
                });
            }
        }
    }
    return Array.from(ruleSet.values());
}
/**
 * Output SARIF to file
 */
function writeSarifFile(results, projectPath, outputPath, options) {
    const fs = require('fs');
    const sarif = outputSarif(results, projectPath, options);
    fs.writeFileSync(outputPath, sarif);
}
exports.default = outputSarif;
//# sourceMappingURL=sarif.js.map