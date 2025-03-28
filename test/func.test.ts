import { checkLatexChinese } from '../src/func';
import assert from 'node:assert';

describe('checkLatexChinese', () => {
    const testCases = [
        {
            name: '纯中文段落',
            input: '这是一个正确的句子，但这里有个错别字：电恼',
            expectedErrors: [
                { word: '电恼', startOffset: 16, endOffset: 18 }
            ]
        },
        {
            name: '混合LaTeX命令',
            input: '中文段落带\\textbf{强调}，还有$公式$和错别字：键康',
            expectedErrors: [
                { word: '键康', startOffset: 24, endOffset: 26 }
            ]
        },
        {
            name: '过滤非中文内容',
            input: 'This is English text with no errors. \\command{} $math$',
            expectedErrors: []
        }
    ];

    testCases.forEach(({ name, input, expectedErrors }) => {
        it(name, async () => {
            const errors = await checkLatexChinese(input);

            assert.strictEqual(errors.length, expectedErrors.length);
            expectedErrors.forEach((expected: any, index: number) => {
                assert.deepStrictEqual(errors[index], {
                    word: expected.word,
                    startOffset: expected.startOffset,
                    endOffset: expected.endOffset
                });
            });
        });
    });
});