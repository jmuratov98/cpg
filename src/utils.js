const path = require('path');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

function copyFileSync(source, target) {
    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function cp_rec(src, dest, doCreate) {
    try{
        let files = [];
    
        const targetFolder = doCreate ? path.join(dest, path.basename(src)) : dest;
        if(!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder);
        }
    
        if(fs.lstatSync(src).isDirectory()) {
            files = fs.readdirSync(src);
            for(let i = 0; i < files.length; i++) {
                const file = files[i];
                const currentSource = path.join(src, file);
                if(fs.lstatSync(currentSource).isDirectory())
                    cp_rec(currentSource, targetFolder, true);
                else
                    copyFileSync(currentSource, targetFolder);
            }
        }
    
    } catch (e) {
        console.log(e);
    }
}

function cp(src, dest) {
    return cp_rec(src, dest, false)
}

function loadTemplate(template, filename) {
    const content = fs.readFileSync(
        path.join(__dirname, 'templates', template, filename),
        'utf-8'
    );

    const render = (locals) => ejs.render(content, locals, { escape: util.inspect });

    return { render };
}

module.exports = { cp, loadTemplate };