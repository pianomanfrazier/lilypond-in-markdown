const htmlmin = require('html-minifier');
const md5 = require('crypto-js/md5');
const fs = require('fs');
const {exec} = require('child_process');
const {svgo} = require('./svgoConfig');

const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true,
});

// The Lilypond extension
function lilypondExtension(nunjucksEngine) {
  return new function() {
    this.tags = ['lilypond'];
    this.parse = function(parser, nodes, lexer) {
      const tok = parser.nextToken();
      const args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      const body = parser.parseUntilBlocks('endlilypond');
      parser.advanceAfterBlockEnd();
      return new nodes.CallExtensionAsync(this, 'run', args, [body]);
    };
    this.run = function(context, param, template, height, body, callback) {
      // get all files from _lilypond/*.ly and compare the hash
      // if not found then generate a new one
      const directory = `_lilypond`;
      const tempString = `
          \\version "2.19"
          #(set! paper-alist (cons '("my size" . (cons (* 130 mm) (* ${height}))) paper-alist))

          \\paper {
              #(set-paper-size "my size")
              indent = 0\\mm
              line-width = 125\\mm
          }
          \\header {
            tagline = ##f %remove default Lilypond footer
          }

          ${body()}`;
      const hash = md5(tempString);
      const lilypondOpen = `<div class="lilypond">`;
      const lilypondClose = `</div>`;
      const files = fs.readdirSync(`${directory}`);
      let isCached = false;
      for (const i in files) {
        if (files[i] === `${hash}.svg`) {
          isCached = true;
        }
      }
      if (isCached) {
        console.log(`Fetching ${hash} from the cache.`);
        if (param === 'inline') {
          fs.readFile(`${directory}/${hash}.min.preview.svg`, function(err, data) {
            if (err) {
              console.error(err);
              return;
            }
            const ret = new nunjucksEngine.runtime.SafeString(minifyHtml(lilypondOpen + String(data) + lilypondClose));
            callback(null, ret);
          });
        } else {
          const ret = new nunjucksEngine.runtime.SafeString(
              minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
          );
          callback(null, ret);
          return;
        }
      } else {
        fs.writeFile(`${directory}/${hash}.ly`, tempString, function(err) {
          if (err) {
            console.error(err);
            return;
          }
          exec(`lilypond -dpreview -dbackend=svg --output=${directory} ${directory}/${hash}.ly`, function(err, stdout, stderr) {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);

            const filename = template === 'preview' ? `${directory}/${hash}.preview.svg` : `${directory}/${hash}.svg`;
            fs.readFile(filename, function(err, data) {
              if (err) {
                console.error(err);
                return;
              }
              // svg optimize
              console.log('svg pre optimized length', data.length);
              svgo.optimize(data, {path: `${directory}/${hash}.preview.svg`}).then(function(result) {
                fs.writeFileSync(`${directory}/${hash}.min.preview.svg`, result.data);
                console.log('svg post optimized length', result.data.length);
                const ret = new nunjucksEngine.runtime.SafeString(
                    minifyHtml(lilypondOpen + `${result.data}` + lilypondClose)
                );
                if (param === 'inline') {
                  callback(null, ret);
                } else {
                  fs.copyFileSync(`${directory}/${hash}.preview.svg`, `img/${hash}.svg`);
                  const ret = new nunjucksEngine.runtime.SafeString(
                      minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
                  );
                  callback(null, ret);
                }
              });
            });
          });
        });
      }
    };
  };
}


module.exports = {lilypondExtension};
