'use strict';
const tap = require('tap');
const LessTask = require('../less.js');
const path = require('path');
const fs = require('fs');

const dest = path.join(__dirname, 'less1', 'expectedOutputs', 'common.dest.css');

tap.beforeEach((done) => {
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  return done();
});

tap.test('will compile a .less file to .css', (t) => {
  const task = new LessTask('less', {
    debug: true,
    modifyVars: {
      'base-path': '"/ui"'
    },
    paths: [
      path.join(__dirname, 'less1', 'includes')
    ],
    files: [
      {
        expand: true,
        cwd: __dirname,
        src: path.join(__dirname, 'less1', '**/*.less'),
        ext: '.css',
        flatten: true,
        dest
      }
    ],
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

tap.test('will compile a .less file to .css in parallel mode', (t) => {
  const task = new LessTask('less', {
    debug: true,
    modifyVars: {
      'base-path': '"/ui"'
    },
    paths: [
      path.join(__dirname, 'less1', 'includes')
    ],
    files: [
      {
        expand: true,
        cwd: __dirname,
        src: path.join(__dirname, 'less1', '**/*.less'),
        ext: '.css',
        flatten: true,
        dest
      }
    ],
    multithread: true
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
