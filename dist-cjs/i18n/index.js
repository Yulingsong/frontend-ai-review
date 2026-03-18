"use strict";
// Internationalization (i18n) for Frontend AI Review
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = void 0;
exports.getTranslations = getTranslations;
exports.t = t;
const en = {
    cli: {
        usage: 'Usage: fair [options] [path]',
        options: 'Options:',
        examples: 'Examples:',
        version: 'Version',
        help: 'Display help'
    },
    messages: {
        analyzing: 'Analyzing',
        foundFiles: 'Found {count} files to analyze',
        noFiles: 'No files found to analyze',
        completed: 'Analysis completed in {time}s',
        noIssues: 'No issues found! 🎉'
    },
    severity: {
        error: 'Error',
        warning: 'Warning',
        suggestion: 'Suggestion'
    },
    summary: {
        title: 'Summary',
        filesAnalyzed: 'Files Analyzed',
        filesWithIssues: 'Files with Issues',
        errors: 'Errors',
        warnings: 'Warnings',
        suggestions: 'Suggestions',
        byCategory: 'By Category'
    },
    rules: {
        fixable: 'Fixable'
    },
    config: {
        created: 'Config file created',
        invalid: 'Invalid config'
    },
    errors: {
        notGitRepo: 'Not a git repository',
        apiKeyRequired: 'API key required',
        analysisFailed: 'Analysis failed'
    }
};
const zh = {
    cli: {
        usage: '用法: fair [选项] [路径]',
        options: '选项:',
        examples: '示例:',
        version: '版本',
        help: '显示帮助'
    },
    messages: {
        analyzing: '正在分析',
        foundFiles: '发现 {count} 个文件待分析',
        noFiles: '没有发现待分析的文件',
        completed: '分析完成，耗时 {time} 秒',
        noIssues: '没有发现问题！🎉'
    },
    severity: {
        error: '错误',
        warning: '警告',
        suggestion: '建议'
    },
    summary: {
        title: '汇总',
        filesAnalyzed: '已分析文件',
        filesWithIssues: '存在问题',
        errors: '错误',
        warnings: '警告',
        suggestions: '建议',
        byCategory: '按类别'
    },
    rules: {
        fixable: '可修复'
    },
    config: {
        created: '配置文件已创建',
        invalid: '无效配置'
    },
    errors: {
        notGitRepo: '非 Git 仓库',
        apiKeyRequired: '需要 API Key',
        analysisFailed: '分析失败'
    }
};
const ja = {
    cli: {
        usage: '使用方法: fair [オプション] [パス]',
        options: 'オプション:',
        examples: '例:',
        version: 'バージョン',
        help: 'ヘルプを表示'
    },
    messages: {
        analyzing: '分析中',
        foundFiles: '{count} ファイルを発見',
        noFiles: '分析するファイルがありません',
        completed: '分析完了 ({time}秒)',
        noIssues: '問題は見つかりませんでした！🎉'
    },
    severity: {
        error: 'エラー',
        warning: '警告',
        suggestion: '提案'
    },
    summary: {
        title: 'サマリー',
        filesAnalyzed: '分析済みファイル',
        filesWithIssues: '問題あり',
        errors: 'エラー',
        warnings: '警告',
        suggestions: '提案',
        byCategory: 'カテゴリ別'
    },
    rules: {
        fixable: '修正可能'
    },
    config: {
        created: '設定ファイルを作成しました',
        invalid: '無効な設定'
    },
    errors: {
        notGitRepo: 'Gitリポジトリではありません',
        apiKeyRequired: 'APIキーが必要です',
        analysisFailed: '分析に失敗しました'
    }
};
const es = {
    cli: {
        usage: 'Uso: fair [opciones] [ruta]',
        options: 'Opciones:',
        examples: 'Ejemplos:',
        version: 'Versión',
        help: 'Mostrar ayuda'
    },
    messages: {
        analyzing: 'Analizando',
        foundFiles: 'Se encontraron {count} archivos para analizar',
        noFiles: 'No se encontraron archivos para analizar',
        completed: 'Análisis completado en {time}s',
        noIssues: '¡No se encontraron problemas! 🎉'
    },
    severity: {
        error: 'Error',
        warning: 'Advertencia',
        suggestion: 'Sugerencia'
    },
    summary: {
        title: 'Resumen',
        filesAnalyzed: 'Archivos analizados',
        filesWithIssues: 'Archivos con problemas',
        errors: 'Errores',
        warnings: 'Advertencias',
        suggestions: 'Sugerencias',
        byCategory: 'Por categoría'
    },
    rules: {
        fixable: 'Arreglable'
    },
    config: {
        created: 'Archivo de configuración creado',
        invalid: 'Configuración inválida'
    },
    errors: {
        notGitRepo: 'No es un repositorio git',
        apiKeyRequired: 'Se requiere API key',
        analysisFailed: 'El análisis falló'
    }
};
const fr = {
    cli: {
        usage: 'Utilisation: fair [options] [chemin]',
        options: 'Options:',
        examples: 'Exemples:',
        version: 'Version',
        help: 'Afficher l\'aide'
    },
    messages: {
        analyzing: 'Analyse en cours',
        foundFiles: '{count} fichiers trouvés à analyser',
        noFiles: 'Aucun fichier à analyser',
        completed: 'Analyse terminée en {time}s',
        noIssues: 'Aucun problème trouvé! 🎉'
    },
    severity: {
        error: 'Erreur',
        warning: 'Avertissement',
        suggestion: 'Suggestion'
    },
    summary: {
        title: 'Résumé',
        filesAnalyzed: 'Fichiers analysés',
        filesWithIssues: 'Fichiers avec problèmes',
        errors: 'Erreurs',
        warnings: 'Avertissements',
        suggestions: 'Suggestions',
        byCategory: 'Par catégorie'
    },
    rules: {
        fixable: 'Corrigeable'
    },
    config: {
        created: 'Fichier de configuration créé',
        invalid: 'Configuration invalide'
    },
    errors: {
        notGitRepo: 'Pas un dépôt git',
        apiKeyRequired: 'Clé API requise',
        analysisFailed: 'L\'analyse a échoué'
    }
};
const de = {
    cli: {
        usage: 'Verwendung: fair [Optionen] [Pfad]',
        options: 'Optionen:',
        examples: 'Beispiele:',
        version: 'Version',
        help: 'Hilfe anzeigen'
    },
    messages: {
        analyzing: 'Analysiere',
        foundFiles: '{count} Dateien gefunden',
        noFiles: 'Keine Dateien zu analysieren',
        completed: 'Analyse abgeschlossen in {time}s',
        noIssues: 'Keine Probleme gefunden! 🎉'
    },
    severity: {
        error: 'Fehler',
        warning: 'Warnung',
        suggestion: 'Vorschlag'
    },
    summary: {
        title: 'Zusammenfassung',
        filesAnalyzed: 'Analysierte Dateien',
        filesWithIssues: 'Dateien mit Problemen',
        errors: 'Fehler',
        warnings: 'Warnungen',
        suggestions: 'Vorschläge',
        byCategory: 'Nach Kategorie'
    },
    rules: {
        fixable: 'Behebbar'
    },
    config: {
        created: 'Konfigurationsdatei erstellt',
        invalid: 'Ungültige Konfiguration'
    },
    errors: {
        notGitRepo: 'Kein Git-Repository',
        apiKeyRequired: 'API-Schlüssel erforderlich',
        analysisFailed: 'Analyse fehlgeschlagen'
    }
};
exports.translations = {
    en,
    zh,
    ja,
    es,
    fr,
    de
};
/**
 * Get translation for current language
 */
function getTranslations(lang) {
    // Auto-detect language
    if (!lang) {
        const envLang = process.env.FAIR_LANG;
        if (envLang && exports.translations[envLang]) {
            return exports.translations[envLang];
        }
        // Try to get from system
        const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
        if (exports.translations[systemLang]) {
            return exports.translations[systemLang];
        }
        return en;
    }
    return exports.translations[lang] || en;
}
/**
 * Interpolate translation with variables
 */
function t(text, vars) {
    if (!vars) {
        return text;
    }
    return text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] || `{${key}}`));
}
exports.default = exports.translations;
//# sourceMappingURL=index.js.map