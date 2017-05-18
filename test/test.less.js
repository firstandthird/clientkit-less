'use strict';
const tap = require('tap');
const LessTask = require('../less.js');
const path = require('path');
const fs = require('fs');

const dest = path.join(__dirname, 'less1', 'expectedOutputs', 'common.dest.css');

tap.test('will compile a .less file to .css', (t) => {
  const task = new LessTask('less', {
    debug: true,
    modifyVars: {
      'base-path': '"/ui"'
    },
    dist: path.join(__dirname, 'less1', 'expectedOutputs'),
    paths: [
      path.join(__dirname, 'less1', 'includes')
    ],
    files: {
      'common.dest.css': path.join(__dirname, 'less1', 'some.less')
    },
  }, {
    runner: {
      run: (taskName) => {
        t.equal(taskName, 'testTask');
      }
    }
  });
  task.execute((err, result) => {
    t.equal(err, null);
    const expected = fs.readFileSync(path.join(__dirname, 'less1', 'expectedOutputs', 'common.css')).toString();
    const actual = fs.readFileSync(dest).toString();
    t.equal(expected, actual);
    t.end();
  });
});