#!/usr/bin/env node

var spec = process.argv[2];
if (!spec) {
  console.error('Usage: npm-deptool <package> (see `npm help install` for the definition of "package")');
  process.exit(1)
}

console.error('Resolving:', spec);

var execFile = require('child_process').execFile;

var mktemp = require('mktemp');

var cwd = mktemp.createDirSync('/tmp/npm-deptool-XXXX');
console.error('Temp dir:', cwd);

console.error('running npm install...')
child = execFile('npm', ['install', '--force', '--ignore-scripts', '--no-bin-links', '--no-optional', spec], {cwd: cwd}, function(err, stdout, stderr) {
  console.log(stdout);
  console.error(stderr);

  if (err) {
    console.error('exec failed:', err);
    process.exit(1);
  }

  console.error('calling read-installed...');
  var readInstalled = require('read-installed');
  readInstalled(cwd, {log: console.error}, function(err, data) {
    if (err) {
      console.error('readInstalled failed:', err)
      process.exit(1)
    }

    var deps = {};
    for (var name in data.dependencies) if (data.dependencies.hasOwnProperty(name)) {
      var d = data.dependencies[name];
      deps[name] = {
        name: d.name,
        version: d.version,
        repository: d.repository,
        _id: d._id,
        _from: d._from,
        _resolved: d._resolved,
      };
    }
    console.log(JSON.stringify(deps, null, 2));
  });

});
