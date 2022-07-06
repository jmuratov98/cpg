const { createCommand, Option } = require('commander');
const inquirer = require('inquirer');
const { findFile, cp, loadTemplate } = require('../utils')
const fs = require('fs/promises');
const path = require('path');

async function promptOptions(opts) {
    const questions = [];
    let answers = {};

    questions.push({
        type: 'list',
        name: 'kind',
        message: 'What kind of application do you want?',
        choices: ['Console', 'Dynamic', 'Static'],
        when: (opts.kind === undefined) && !opts.default,
        default: 'Console'
    })

    questions.push({
        type: 'list',
        name: 'language',
        message: 'What kind of language do you want to use?',
        choices: ['C', 'C++'],
        when: !opts.default,
        default: 'Console'
    })

    answers = await inquirer.prompt(questions);

    return {
        ...opts,
        kind: answers.kind || opts.kind || 'Console',
        language: answers.language || 'C++',
    }
}

async function scaffoldProject(projectName, template) {
    try {

        const filepath = findFile(process.cwd(), 'cpg.json');
        if(filepath === undefined) {
            console.error('File not found');
            return;
        }

        const PROJECT_DIR = path.join(filepath, projectName);
        
        const content = await fs.readFile(
            path.join(filepath, 'cpg.json'),
            'utf-8'
        );
        const cpg = JSON.parse(content);
    
        cpg.projects.push({
            name: projectName,
            directory: projectName,
            language: template.language,
            kind: template.kind
        });
    
        await fs.writeFile(path.join(filepath, 'cpg.json'), JSON.stringify(cpg, null, 2));

        // Creates the directory for the new project
        await fs.mkdir(PROJECT_DIR);

        // Copys the specific file over
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

        if(cpg.buildSystem == 'Premake') {
            let kind;
            switch (template.kind) {
                case 'Console': kind = 'ConsoleApp'; break;
                case 'Dynamic': kind = 'SharedLib'; break;
                case 'Static': kind = 'StaticApp'; break;
                default: break;
            }

            await fs.appendFile(
                path.join(filepath, 'premake5.lua'),
                `\ninclude "${projectName}"`
            )

            if (!template.bare) {
                const premake5Project = loadTemplate('premake', 'premake5-project.lua');
                fs.writeFile(path.join(PROJECT_DIR, 'premake5.lua'), premake5Project.render({ appName: projectName, language: template.language, kind: kind }));
            }
        }

    } catch (e) {
        console.error(e);
    }

}

async function handleAction(projectName, opts) {
    const template = await promptOptions(opts)
    await scaffoldProject(projectName, template);
}

function add() {
    const create = createCommand();

    create
        .name('add')
        .description('adds a project to an existing cpg workspace')
        .argument('<app-name>')
        .option('-d --default', 'Generates a default project', false)
        .option('-b --bare', 'Generates an empty project', false)
        .addOption(
            new Option('-S --static', 'Generates a static library')
                .implies({ kind: 'Static' })
        )
        .addOption(
            new Option('-s --shared', 'Generates a shared library')
                .implies({ kind: 'Dynamic' })
        )
        .addOption(
            new Option('-c --console', 'Generates a static library')
                .implies({ kind: 'Console' })
        )
        .action(handleAction);

    return create;
}

module.exports = {
    add
}