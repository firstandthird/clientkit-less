'use strict';
const less = require('less');
const TaskKitTask = require('taskkit-task');
const async = require('async');
const fs = require('fs');
const glob = require('glob');
const os = require('os');

class LessTask extends TaskKitTask {

  get description() {
    return 'This task uses the less compiler to transform .less files into .css files';
  }

  execute(allDone) {
    const items = this.options.files || this.options.items;
    if (!items) {
      return allDone();
    }
    if (this.options.enabled === false) {
      this.log(`${this.name} skipped because it is disabled`);
      return allDone();
    }
    const allStart = new Date().getTime();
    async.map(items, (fileStruct, next) => {
      const start = new Date().getTime();
      this.process(fileStruct.src, fileStruct.dest, (err, results) => {
        if (err) {
          return next(err);
        }
        const end = new Date().getTime();
        const duration = (end - start) / 1000;
        this.log(`Processed ${fileStruct.dest} in ${duration} sec`);
        next(null, results);
      });
    }, (err, results) => {
      if (err) {
        return allDone(err);
      }
      const allEnd = new Date().getTime();
      const duration = (allEnd - allStart) / 1000;
      this.log(`Processed all ${this.name} in ${duration} sec`);
      this.onFinish(results, allDone);
    });
  }

  process(input, file, allDone) {
    const options = this.options;
    async.autoInject({
      fileNames(done) { glob(input, {}, done); },
      fileContents: (fileNames, done) => {
        const seriesResult = [];
        async.eachSeries(fileNames, (fileName, eachDone) => {
          if (!fileName) {
            return eachDone();
          }
          fs.readFile(fileName, (err, data) => {
            if (err) {
              return eachDone(err);
            }
            seriesResult.push(data.toString());
            eachDone();
          });
        }, (err) => {
          done(err, seriesResult.join(os.EOL));
        });
      },
      render(fileContents, done) {
        less.render(fileContents, options, done);
      },
      css(render, done) {
        fs.writeFile(file, render.css, done);
      },
      map(render, done) {
        if (!options.sourceMap || options.sourceMapFileInline) {
          return done();
        }
        fs.writeFile(options.sourceMapFilename || `${file}.map`, render.map, done);
      }
    }, allDone);
  }
}
module.exports = LessTask;
