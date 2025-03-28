"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const func_1 = require("../src/func");
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
    test.each(testCases)('$name', async ({ input, expectedErrors }) => {
        const errors = await (0, func_1.checkLatexChinese)(input);
        expect(errors).toHaveLength(expectedErrors.length);
        expectedErrors.forEach((expected, index) => {
            expect(errors[index]).toMatchObject({
                word: expected.word,
                startOffset: expected.startOffset,
                endOffset: expected.endOffset
            });
        });
    });
});
//# sourceMappingURL=func.test.js.map