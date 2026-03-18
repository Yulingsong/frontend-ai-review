// SARIF output formatter for Frontend AI Review

import type { AnalysisResult } from './types/index.js';
import { getRelativePath } from './utils/index.js';

/**
 * SARIF (Static Analysis Results Interchange Format) output
 * https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */
export function outputSarif(
  results: AnalysisResult[],
  projectPath: string,
  options: {
    repoUri?: string;
    commitSha?: string;
  } = {}
): string {
  // Convert issues to SARIF format
  const resultsList = [];

  for (const result of results) {
    if (result.issues.length === 0) {continue;}

    const filePath = getRelativePath(result.file, projectPath);

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
  const sarif: Record<string, unknown> = {
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
    const runs = sarif.runs as Array<Record<string, unknown>>;
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
function mapSeverityToSarif(severity: string): string {
  switch (severity) {
    case 'error': return 'error';
    case 'warning': return 'warning';
    default: return 'note';
  }
}

/**
 * Extract unique rules from results
 */
function getUniqueRules(results: AnalysisResult[]): Array<{
  id: string;
  name: string;
  shortDescription: { text: string };
  defaultConfiguration?: { level: string };
}> {
  const ruleSet = new Map<string, unknown>();

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

  return Array.from(ruleSet.values()) as Array<{
    id: string;
    name: string;
    shortDescription: { text: string };
    defaultConfiguration?: { level: string };
  }>;
}

/**
 * Output SARIF to file
 */
export function writeSarifFile(
  results: AnalysisResult[],
  projectPath: string,
  outputPath: string,
  options?: {
    repoUri?: string;
    commitSha?: string;
  }
): void {
  const fs = require('fs');
  const sarif = outputSarif(results, projectPath, options);
  fs.writeFileSync(outputPath, sarif);
}

export default outputSarif;
