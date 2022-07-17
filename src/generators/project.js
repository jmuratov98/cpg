const Generator = require('./index');
const fs = require('fs/promises');
const { readFileSync } = require('fs');
const { loadTemplate, findFile, cp } = require('../utils');
const path = require('path');

class ProjectGenerator extends Generator {

    #cpgjsonCache;
    #PROJECT_DIR

    constructor(projectName, opts) {
        try {
            super(projectName, opts);

            const filepath = findFile(process.cwd(), 'cpg.json');
            if (filepath == undefined) {
                throw new Error('This is not a cpg workspace');
            }

            const file = path.join(filepath, 'cpg.json');
            const content = JSON.parse(readFileSync(file, 'utf-8'));

            this.#cpgjsonCache = {
                filepath: file,
                content: content
            }

            this.#PROJECT_DIR = path.join(filepath, this.name);
        } catch (e) {
            throw e;
        }
    }

    async _generateCpgFile() {
        const { content, filepath } = this.#cpgjsonCache;

        content.projects.push({
            name: this.name,
            directory: this.name,
            language: this.opts.language,
            kind: this.opts.kind
        });

        try {
            await fs.writeFile(
                filepath,
                JSON.stringify(content, null, 2)
            );
        } catch (e) {
            throw e;
        }
    }

    async _generateProjectFiles() {
        if (this.opts.bare) return;

        try {
            const lang = this.parseLanguage();

            await fs.mkdir(this.#PROJECT_DIR, { recursive: true });

            cp(
                path.join(__dirname, '../templates/', lang),
                this.#PROJECT_DIR,
            )

        } catch (e) {
            throw e;
        }
    }

    async _generateBuildSystemFiles() {
        // TODO: Change this implementation later
        const { content, filepath } = this.#cpgjsonCache;
        
        if (content.buildSystem != 'Premake')
            throw new Error(`Unknown Build System recieved '${this.#cpgjsonCache.content.buildSystem}', but expects 'Premake'`);

        await fs.appendFile(
            path.join(path.dirname(filepath), 'premake5.lua'),
            `\ninclude "${this.name}"`
        )

        if(this.opts.bare) return;
        
        const kind = this.parseKindPremake();
        const premake5Project = loadTemplate('premake', 'premake5-project.lua');
        fs.writeFile(path.join(this.#PROJECT_DIR, 'premake5.lua'), premake5Project.render({ appName: this.name, language: this.opts.language, kind }));
    }

    generate() {
        this._generateCpgFile();

        this._generateProjectFiles();

        this._generateBuildSystemFiles();
    }

}

module.exports = ProjectGenerator;