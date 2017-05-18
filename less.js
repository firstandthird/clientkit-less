'use strict';
const less = require('less');
const TaskKitTask = require('taskkit-task');
const async = require('async');
const fs = require('fs');
const os = require('os');

class LessTask extends TaskKitTask {

  get description() {
    return 'This task uses the less compiler to transform .less files into .css files';
  }

  process(input, file, allDone) {
    const options = this.options;
    async.autoInject({
      fileContents: (done) => {
        fs.readFile(input, (err, data) => {
          if (err) {
            return done(err);
          }

          return done(null, data.toString());
        });
      },
      render(fileContents, done) {
        less.render(fileContents, options, done);
      },
      css(render, done) {
        done(null, render.css);
      },
      map(render, done) {
        if (!options.sourceMap || options.sourceMapFileInline) {
          return done(null, false);
        }

        done(null, render.map);
      }
    }, (err, results) => {
      if (err) {
        return allDone(err);
      }

      const files = {};

      files[file] = results.css;

      if (results.map) {
        files[options.sourceMapFilename || `${file}.map`] = results.map;
      }

      this.writeMany(files, allDone);
    });
  }
}
module.exports = LessTask;
