const { createCommand, Option } = require('commander');
const inquirer = require('inquirer');
const ProjectGenerator = require('../generators/project')

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

async function handleAction(projectName, opts) {
    try {
        const template = await promptOptions(opts)
        const generator = new ProjectGenerator(projectName, template);

        generator.generate();

    } catch (e) {
        console.trace(e);
    }
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