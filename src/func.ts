import * as nodejieba from 'nodejieba';
import * as Spellchecker from 'spellchecker';

interface TextSegment {
    text: string;
    startOffset: number;
    endOffset: number;
}

interface SpellError {
    word: string;
    startOffset: number;
    endOffset: number;
}

export async function checkLatexChinese(text: string): Promise<SpellError[]> {
    // 初始化分词器和拼写检查
    nodejieba.load();
    Spellchecker.setDictionary('zh_CN', './dict');

    // 分割latex文本
    const segments = splitLatex(text);

    // 处理每个中文段落
    const errors: SpellError[] = [];
    for (const seg of segments) {
        if (!containsChinese(seg.text)) continue;

        // 分词处理
        const tokens = tokenizeChinese(seg.text);

        // 拼写检查
        const segmentErrors = await checkSpelling(tokens);

        // 转换坐标到原始文本
        errors.push(...mapPositions(segmentErrors, seg.startOffset));
    }
    return errors;
}

function splitLatex(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const latexPattern = /\\[a-zA-Z]+|\\(?:\[.*?\]|\{.*?\})|\$\$.+?\$\$|%.*|\s+/gs;
    let lastIndex = 0;

    text.replace(latexPattern, (match, offset) => {
        if (offset > lastIndex) {
            segments.push({
                text: text.slice(lastIndex, offset),
                startOffset: lastIndex,
                endOffset: offset
            });
        }
        lastIndex = offset + match.length;
        return match;
    });

    // 添加最后一段
    if (lastIndex < text.length) {
        segments.push({
            text: text.slice(lastIndex),
            startOffset: lastIndex,
            endOffset: text.length
        });
    }
    return segments.filter(s => s.text.trim().length > 0);
}

function containsChinese(text: string): boolean {
    return /[\u4E00-\u9FA5]/.test(text);
}

function tokenizeChinese(text: string): TextSegment[] {
    const result: TextSegment[] = [];
    let offset = 0;

    for (const word of nodejieba.cut(text)) {
        const start = text.indexOf(word, offset);
        if (start === -1) continue;

        const end = start + word.length;
        result.push({
            text: word,
            startOffset: start,
            endOffset: end
        });
        offset = end;
    }
    return result;
}

async function checkSpelling(tokens: TextSegment[]): Promise<SpellError[]> {
    const errors: SpellError[] = [];

    for (const token of tokens) {
        if (!Spellchecker.checkSpelling(token.text)) {
            errors.push({
                word: token.text,
                startOffset: token.startOffset,
                endOffset: token.endOffset
            });
        }
    }
    return errors;
}

function mapPositions(errors: SpellError[], offset: number): SpellError[] {
    return errors.map(err => ({
        ...err,
        startOffset: err.startOffset + offset,
        endOffset: err.endOffset + offset
    }));
}