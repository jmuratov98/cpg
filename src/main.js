const { program } = require('commander');

const { name, version } = require('../package.json')
const { create } = require('./commands/create.js')

async function main(args) {
    program
        .name(name)
        .version(version)
        .addCommand(create())
        .parse(args);
}

module.exports = main;