import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'

export type TokenType = 'keyword' | 'string' | 'number' | 'property' | 'comment' | 'punctuation' | 'plain'

export interface Token {
    text: string
    type: TokenType
}

export const TOKEN_COLORS: Record<TokenType, string> = {
    keyword:     'text-blue-400',
    string:      'text-green-400',
    number:      'text-orange-400',
    property:    'text-purple-400',
    comment:     'text-[var(--gh-text-secondary)]',
    punctuation: 'text-[var(--gh-text-secondary)]',
    plain:       'text-[var(--gh-code-text)]',
}

interface Rule { type: TokenType; regex: RegExp }

function tokenizeWithRules(code: string, rules: Rule[]): Token[] {
    const tokens: Token[] = []
    let i = 0
    outer: while (i < code.length) {
        for (const rule of rules) {
            rule.regex.lastIndex = i
            const m = rule.regex.exec(code)
            if (m && m.index === i) {
                tokens.push({ text: m[0], type: rule.type })
                i += m[0].length
                continue outer
            }
        }
        // ponytail: no rule matched — consume one char as plain
        const last = tokens[tokens.length - 1]
        if (last?.type === 'plain') last.text += code[i]
        else tokens.push({ text: code[i], type: 'plain' })
        i++
    }
    return tokens
}

const PHP_SWAGGER_RULES: Rule[] = [
    { type: 'comment',     regex: /\/\*\*|\*\/|^\s*\*/gm },
    { type: 'keyword',     regex: /@OA\\[A-Za-z]+/g },
    { type: 'string',      regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'number',      regex: /\b\d+\b/g },
    { type: 'property',    regex: /\b[a-z][a-zA-Z]+(?==)/g },
    { type: 'punctuation', regex: /[(){}=,\[\]]/g },
]

const PHP_ATTRIBUTE_RULES: Rule[] = [
    { type: 'keyword',     regex: /#\[OA\\[A-Za-z]+|new\s+OA\\[A-Za-z]+/g },
    { type: 'string',      regex: /'(?:[^'\\]|\\.)*'/g },
    { type: 'number',      regex: /\b\d+\b/g },
    { type: 'property',    regex: /\b[a-z][a-zA-Z]+(?=:)/g },
    { type: 'punctuation', regex: /[()=,\[\]:#\[\]]/g },
]

const OPENAPI_JSON_RULES: Rule[] = [
    { type: 'property',    regex: /"[^"]+?"(?=\s*:)/g },
    { type: 'string',      regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'keyword',     regex: /\b(true|false|null)\b/g },
    { type: 'number',      regex: /\b\d+(\.\d+)?\b/g },
    { type: 'punctuation', regex: /[{}\[\]:,]/g },
]

const JS_JSDOC_RULES: Rule[] = [
    { type: 'comment',     regex: /\/\*\*|\*\/|^\s*\*/gm },
    { type: 'keyword',     regex: /@openapi|@[a-z]+/g },
    { type: 'string',      regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'number',      regex: /\b\d+\b/g },
    { type: 'property',    regex: /^  [a-z]+:/gm },
    { type: 'punctuation', regex: /[{}:,\[\]]/g },
]

export function tokenize(code: string, target: AnnotationTarget): Token[] {
    switch (target) {
        case 'php-swagger':   return tokenizeWithRules(code, PHP_SWAGGER_RULES)
        case 'php-attribute': return tokenizeWithRules(code, PHP_ATTRIBUTE_RULES)
        case 'openapi-json':  return tokenizeWithRules(code, OPENAPI_JSON_RULES)
        case 'js-jsdoc':      return tokenizeWithRules(code, JS_JSDOC_RULES)
    }
}
