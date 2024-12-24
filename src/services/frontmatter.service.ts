import * as yaml from 'js-yaml';

const optionalByteOrderMark = '\\ufeff?';
const platform = typeof process !== 'undefined' ? process.platform : '';
const pattern =
    '^(' +
    optionalByteOrderMark +
    '(= yaml =|---)' +
    '$([\\s\\S]*?)' +
    '^(?:\\2|\\.\\.\\.)\\s*' +
    '$' +
    (platform === 'win32' ? '\\r?' : '') +
    '(?:\\n)?)';

const regex = new RegExp(pattern, 'm');

interface ExtractorResult {
    attributes: Record<string, unknown>;
    body: string;
    bodyBegin: number;
    frontmatter?: string;
}

interface ParseOptions {
    ignoreDuplicateKeys?: boolean;
}

function computeLocation(match: RegExpExecArray, body: string): number {
    let line = 1;
    let pos = body.indexOf('\n');
    const offset = match.index + match[0].length;

    while (pos !== -1) {
        if (pos >= offset) {
            return line;
        }
        line++;
        pos = body.indexOf('\n', pos + 1);
    }

    return line;
}

export function frontmatterParse(
    string: string,
    options?: ParseOptions,
): ExtractorResult {
    const match = regex.exec(string);
    if (!match) {
        return {
            attributes: {},
            body: string,
            bodyBegin: 1,
        };
    }

    const yamlContent = match?.[match.length - 1]?.replace(/^\s+|\s+$/g, '');

    if (!yamlContent) {
        return {
            attributes: {},
            body: string,
            bodyBegin: 1,
        };
    }

    let attributes: Record<string, unknown> = {};

    if (options?.ignoreDuplicateKeys) {
        yaml.loadAll(
            yamlContent,
            (doc) => {
                attributes = {
                    ...attributes,
                    ...(doc as Record<string, unknown>),
                };
            },
            { json: true },
        );
    } else {
        attributes = (yaml.load(yamlContent) as Record<string, unknown>) || {};
    }

    const body = string.replace(match[0], '');
    const line = computeLocation(match, string);

    return {
        attributes,
        body,
        bodyBegin: line,
        frontmatter: yamlContent,
    };
}
