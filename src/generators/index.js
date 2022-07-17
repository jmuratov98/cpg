

class Generator {
    #name;
    #opts;

    constructor(name, opts) {
        this.#name = name;
        this.#opts = opts;
    }

    parseLanguage() {
        switch (this.#opts.language) {
            case 'C++': return 'cpp';
            case 'C':   return 'c';
            default:    throw new Error('Invalid language')
        }
    }

    parseKindPremake() {
        switch (this.#opts.kind) {
            case 'Console':     return 'ConsoleApp';
            case 'Dynamic':     return 'SharedLib';
            case 'Static':      return 'StaticLib';
            default:            throw new Error('Unknown kind of application')
        }
    }

    get name() { return this.#name; }
    get opts() { return this.#opts; }

}

module.exports = Generator;