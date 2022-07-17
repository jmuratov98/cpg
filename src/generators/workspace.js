const Generator = require('./index');
const path = require('path');
const fs = require('fs/promises');
const { cp, loadTemplate } = require('../utils');
const simpleGit = require('simple-git')

class WorkspaceGenerator extends Generator {

    constructor(workspaceName, opts) {
        super(workspaceName, opts);
        this.WORKSPACE_DIR = path.join(process.cwd(), workspaceName);
        this.PROJECT_DIR = path.join(this.WORKSPACE_DIR, workspaceName);
    }

    // This could probably be moved into the parent class
    async _generateWorkspaceFolder() {
        try {
            await fs.mkdir(this.WORKSPACE_DIR, { recursive: true });
        } catch (e) {
            throw e;
        }
    }

    async _generateCpgJsonFile() {

        const cpgjson = {
            name: this.name,
            buildSystem: this.opts.buildSystem,
            projects: []
        };

        if (!this.opts.bare) {
            cpgjson.projects[0] = {
                name: this.name,
                dir: this.name,
                language: this.opts.language,
                kind: this.opts.kind
            }
        }

        try {
            await fs.writeFile(
                path.join(this.WORKSPACE_DIR, 'cpg.json'),
                JSON.stringify(cpgjson, null, 2)
            );
        } catch (e) {
            throw e;
        }
    }

    async _generateProjectFiles() {
        if (this.opts.bare) return;

        try {
            const lang = this.parseLanguage();

            await fs.mkdir(this.PROJECT_DIR, { recursive: true });

            cp(
                path.join(__dirname, '../templates/', lang),
                this.PROJECT_DIR,
            )

        } catch (e) {
            throw e;
        }

    }

    async _generateBuildSystemFiles() {
        // TODO: Change this implementation later
        if (this.opts.buildSystem != 'Premake')
            throw new Error(`Unknown Build System recieved '${this.opts.buildSystem}, but expects 'Premake'`);

        const premake5Workspace = loadTemplate('premake', 'premake5-workspace.lua');
        await fs.writeFile(
            path.join(this.WORKSPACE_DIR, 'premake5.lua'),
            premake5Workspace.render({ appName: this.name })
        );

        const kind = this.parseKindPremake();

        if (!this.opts.bare) {
            const premake5Project = loadTemplate('premake', 'premake5-project.lua');
            await fs.writeFile(
                path.join(this.PROJECT_DIR, 'premake5.lua'),
                premake5Project.render({ appName: this.name, language: this.opts.language, kind: kind })
            );
        }

        // Copy premake5.exe
        await fs.mkdir(
            path.join(this.WORKSPACE_DIR, 'lib/premake5/bin'),
            { recursive: true }
        );

        await fs.copyFile(
            path.join(__dirname, '../templates/premake/premake5.exe'),
            path.join(this.WORKSPACE_DIR, 'lib/premake5/bin/premake5.exe')
        );

        // gen_project.bat
        await fs.mkdir(
            path.join(this.WORKSPACE_DIR, 'scripts'),
            { recursive: true }
        );

        await fs.copyFile(
            path.join(__dirname, '../templates/premake/gen_project.bat'),
            path.join(this.WORKSPACE_DIR, 'scripts/gen_project.bat')
        );
    }

    async _generateGitRepository() {
        if(!this.opts.git) return

        try {
            const git = simpleGit({
                baseDir: path.join(process.cwd(), this.name)
            });
    
            await git.init();
            await git.add('-A');
            await git.commit('Initial Commit');

        } catch(e) {
            throw e;
        }
    }

    async generate() {
        try {
            await this._generateWorkspaceFolder()

            await this._generateCpgJsonFile()

            await this._generateProjectFiles()

            await this._generateBuildSystemFiles()

            await this._generateGitRepository();

        } catch (e) {
            console.trace(e);
        }
    }

}

module.exports = WorkspaceGenerator;