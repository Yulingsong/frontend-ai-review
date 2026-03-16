// Types
interface Issue {
  id: string;
  category: string;
  ruleId: string;
  message: string;
  severity: string;
  location: { start: { line: number; column: number }; end: { line: number; column: number } };
  fixable: boolean;
  fix?: string;
}

export type { Issue };
