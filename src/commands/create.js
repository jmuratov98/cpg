const { createCommand } = require('commander');
const { prompt } = require('inquirer');
const { cp, loadTemplate } = require('../utils')
const path = require('path');
const fs = require('fs/promises');
const simpleGit = require('simple-git');

async function promptOptions(opts) {
    const questions = [];
    let answers = {};

    if (!opts.default) {

        // Workspace Questions
        opts.git ?? questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Would you like to initialize a new git repository?'
        });

        questions.push({
            type: 'list',
            name: 'build-system',
            message: 'Which build system do you want to use?',
            choices: ['Premake', 'CMake (Does not currently work)']
        });

        // Project Questions
        questions.push({
            type: 'list',
            name: 'language',
            message: 'Which language do you want to use?',
            choices: ['C++', 'C'],
            when: !opts.bare
        });

        questions.push({
            type: 'list',
            name: 'kind',
            message: 'What kind of application do you want?',
            choices: ['Console', 'Dynamic', 'Static'],
            when: !opts.bare
        })

        answers = await prompt(questions);
    }

    return {
        ...opts,
        git: answers.git || opts.git,
        language: answers.language || 'C++',
        buildSystem: answers.buildSystem || 'Premake',
        kind: answers.kind || 'Console',
    }
}

async function scaffoldWorkspace(appName, template) {
    const WORKSPACE_DIR = path.join(process.cwd(), appName);
    const PROJECT_DIR = path.join(WORKSPACE_DIR, appName);

    // This only works for premake
    let kind;
    switch (template.kind) {
        case 'Console': kind = 'ConsoleApp'; break;
        case 'Dynamic': kind = 'SharedLib'; break;
        case 'Static': kind = 'StaticApp'; break;
        default: break;
    }

    const cpgjson = {
        name: appName,
        buildSystem: template.buildSystem,
        projects: []
    };

    if (!template.bare) {
        cpgjson.projects[0] = {
            name: appName,
            dir: appName,
            language: template.language,
            kind: kind
        }
    }

    try {
        // Creating the project and workspace directory
        await fs.mkdir(WORKSPACE_DIR, { recursive: true });

        // Creating the cpg.json file
        await fs.writeFile(
            path.join(WORKSPACE_DIR, 'cpg.json'),
            JSON.stringify(cpgjson, null, 2)
        );

        let lang = '';
        switch (template.language) {
            case 'C++': lang = 'cpp'; break;
            case 'C': lang = 'c'; break;
            default: break;
        }

        if (!template.bare) {
            await fs.mkdir(PROJECT_DIR, { recursive: true });

            cp(
                path.join(__dirname, '../templates/', lang),
                PROJECT_DIR,
            )
        }

        // Build System
        if (template.buildSystem == 'Premake') {
            const premake5Workspace = loadTemplate('premake', 'premake5-workspace.lua');
            fs.writeFile(path.join(WORKSPACE_DIR, 'premake5.lua'), premake5Workspace.render({ appName }));

            if (!template.bare) {
                const premake5Project = loadTemplate('premake', 'premake5-project.lua');
                fs.writeFile(path.join(PROJECT_DIR, 'premake5.lua'), premake5Project.render({ appName, language: template.language, kind: kind }));
            }

            // Copy premake5.exe
            await fs.mkdir(
                path.join(WORKSPACE_DIR, 'lib/premake5/bin'),
                { recursive: true }
            );

            await fs.copyFile(
                path.join(__dirname, '../templates/premake/premake5.exe'),
                path.join(WORKSPACE_DIR, 'lib/premake5/bin/premake5.exe')
            );

            // gen_project.bat
            await fs.mkdir(
                path.join(WORKSPACE_DIR, 'scripts'),
                { recursive: true }
            );

            await fs.copyFile(
                path.join(__dirname, '../templates/premake/gen_project.bat'),
                path.join(WORKSPACE_DIR, 'scripts/gen_project.bat')
            );
        }


    } catch (e) {
        console.error(e);
    }

}

async function handleAction(appName, opts) {
    try {
        const template = await promptOptions(opts);

        await scaffoldWorkspace(appName, template);

        if (template.git) {
            const git = simpleGit({
                baseDir: path.join(process.cwd(), appName)
            });

            await git.init();
            await git.add('-A');
            await git.commit('Initial Commit');
        }
    } catch (e) {
        console.error(e);
    }

}

function create() {
    const create = createCommand();

    create
        .name('create')
        .description('creates a new workspace')
        .argument('<app-name>')
        .option('-d --default', 'Generates a default workspace', false)
        .option('-b --bare', 'Generates an empty workspace', false)
        .option('-f --force', 'Overwrite target directory if it exists', false)
        .option('-g --git', 'Initializes a git repository', true)
        .option('-n --no-git', 'Does not initializes a git repository', false)
        .action(handleAction);

    return create;
}

module.exports = {
    create
}