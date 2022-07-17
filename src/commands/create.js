const { createCommand } = require('commander');
const { prompt } = require('inquirer');
const WorkspaceGenerator = require('../generators/workspace');

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

async function handleAction(appName, opts) {
    try {
        const template = await promptOptions(opts)
        const generator = new WorkspaceGenerator(appName, template);

        generator.generate();

    } catch (e) {
        console.trace(e);
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