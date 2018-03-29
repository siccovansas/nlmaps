const shell = require('shelljs');
const conf = require('./conf.json');
const helpers = require('./helpers');
const { spawn } = require('child_process')
const chokidar = require('chokidar');

const tasks = helpers.tasks();

const rollup_args = ['-c', 'config/rollup.all.js'];

//if user passed watch flag to wrapper, use rollup's watch mode
if (helpers.args.watch) {
  rollup_args.unshift('--watch')
}

function main() {
  //run each package's rollup command from the package's directory
  //and capture/log output
  tasks.forEach(task => {
    console.log(rollup_args)
    const build = spawn('rollup', rollup_args, {cwd: 'packages/' + helpers.packagePath(task)});

    build.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    build.stderr.on('data', (data) => {
      console.log(`${data}`);
    });

    build.on('close', (code) => {
      console.log(`child process for ${task} exited with code ${code}`);
    });
  })
}


//copy assets to dist
if (helpers.args.watch) {
  chokidar.watch('packages/assets/').on('all',(event, path) => {
    let newpath = path.split('/');
    newpath.splice(0,2);
    let newpathstring = newpath.join('/');
    console.log(newpathstring);
    tasks.forEach( task => {
      shell.cp('-u', path, 'packages/' + helpers.packagePath(task) + '/build/assets/' + newpathstring);
         
    
    } )

  })
}

//one-off copy
tasks.forEach(task => {
 shell.cp('-uR', 'packages/assets/css/*.css', 'packages/' + helpers.packagePath(task) + '/build/assets/css/');
 shell.cp('-uR', 'packages/assets/img/*', 'packages/' + helpers.packagePath(task) + '/build/assets/img/');

})

if (typeof require !== 'undefined' && require.main === module) {
    main();
}

module.exports = main; 
