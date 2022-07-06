const { program } = require('commander');

const { name, version } = require('../package.json')
const { create } = require('./commands/create.js')
const { add } = require('./commands/add.js')

async function main(args) {
    program
        .name(name)
        .version(version)
        .addCommand(create())
        .addCommand(add())
        .parse(args);
}

module.exports = main;