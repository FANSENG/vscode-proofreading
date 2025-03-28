declare module 'spellchecker' {
    interface SpellcheckerStatic {
        setDictionary(lang: string, dictPath: string): void;
        checkSpelling(word: string): boolean;
    }

    const Spellchecker: SpellcheckerStatic;
    export = Spellchecker;
}