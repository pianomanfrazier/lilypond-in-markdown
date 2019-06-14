const htmlmin = require('html-minifier');
const md5 = require('crypto-js/md5');
const fs = require('fs');
const {exec} = require('child_process');
const {svgo} = require('./svgoConfig');

const audioFileExtensions = [ { extension: 'ogg', flag: '-Ov'}, { extension: 'flac', flag: '-OF'}]

const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true,
});

function lilyaudioExtension(nunjucksEngine) {
    return new function() {
      this.tags = ['lilyaudio'];
      this.parse = function(parser, nodes, lexer) {
          var tok = parser.nextToken();
          var args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);
          var body = parser.parseUntilBlocks('endlilyaudio');
          parser.advanceAfterBlockEnd();
          return new nodes.CallExtensionAsync(this, 'run', args, [body]);
      };
      this.run = function(context, param, template, height, audio, body, callback) {
          // get all files from _lilypond/*.ly and compare the hash
          // if not found then generate a new one
          let directory = `_lilypond`
          let tempString = `
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

          ${body()}`
          let hash = md5(tempString); //need a better caching strategy
          let lilypondWrapper = `<div class="lilypond-container"><div class="lilypond" onclick="togglePlayAudio('${hash}')">`;
          let audioMarkup = audio === 'none'
            ? '</div><!-- lilypond wrapper -->'
            : `</div><!-- Lilypond Wrapper -->
              <div class="lilypond-audio paused" data-audio="${hash}">
                <div class="progress-bar"><div class="inner-progress-bar"></div></div><!-- progress bar-->
                <button onclick="rewindAudio('${hash}')">
                  <svg class="i-backwards" viewBox="0 0 32 32" width="16" height="16" fill="currentcolor" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M16 2 L2 16 16 30 16 16 30 30 30 2 16 16 Z" />
                  </svg>
                </button>
                <button onclick="togglePlayAudio('${hash}')">
                  <svg class="i-play" viewBox="0 0 32 32" width="24" height="24" fill="currentcolor" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M10 2 L10 30 24 16 Z" />
                  </svg>
                  <svg class="i-pause" viewBox="0 0 32 32" width="24" height="24" fill="currentcolor" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M23 2 L23 30 M9 2 L9 30" />
                  </svg>
                </button>
                <button onclick="ffAudio('${hash}')">
                  <svg class="i-forwards" viewBox="0 0 32 32" width="16" height="16" fill="currentcolor" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M16 2 L30 16 16 30 16 16 2 30 2 2 16 16 Z" />
                  </svg>
                </button>
              </div></div><!-- lilypond-container -->`
          let files = fs.readdirSync(`${directory}`);
          let isCached = false;
          for (var i in files) {
            if (files[i] === `${hash}.svg`) {
              isCached = true;
            }
          }
          if (isCached) {
            console.log(`Fetching ${hash} from the cache.`)
            if (param === 'inline') {
              fs.readFile(`${directory}/${hash}.min.preview.svg`, function(err, data) {
                  if(err) {
                      console.error(err);
                      return;
                  }
                  let ret = new nunjucksEngine.runtime.SafeString(minifyHtml(lilypondWrapper + String(data) + audioMarkup));
                  callback(null, ret);
              })
            } else {
                let ret = new nunjucksEngine.runtime.SafeString(
                  minifyHtml(lilypondWrapper + `<img src='/img/${hash}.svg' >` + audioMarkup)
                )
                callback(null, ret);
                return;
            }
          } else {
            fs.writeFile(`${directory}/${hash}.ly`, tempString, function(err) {
              if(err) {
                  console.error(err);
                  return;
              }
              exec(`lilypond -dpreview -dbackend=svg --output=${directory} ${directory}/${hash}.ly`, function (err, stdout, stderr) {
                  if (err) {
                      console.error(err);
                      return;
                  }
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);
                  if (audio !== 'none') {
                    for (var i in audioFileExtensions) {
                      let ext = audioFileExtensions[i];
                      exec(`timidity -c _timidity/${audio}.cfg ${ext.flag} ${directory}/${hash}.midi -o ${directory}/${hash}.${ext.extension}`, function(err, stdout, stderr) {
                        if (err) {
                          console.error(err);
                          return;
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                        if (ext.extension === 'flac') {
                          // convert flac to mp3
                          exec(`ffmpeg -i ${directory}/${hash}.flac -vn -ar 11025 -ac 2 -ab 192k -f mp3 ${directory}/${hash}.mp3`, function(err, stdout, stderr) {
                          if (err) {
                            console.error(err);
                            return;
                          }
                          console.log(`stdout: ${stdout}`);
                          console.error(`stderr: ${stderr}`);
                          fs.copyFileSync(`${directory}/${hash}.mp3`, `audio/${hash}.mp3`);
                          });
                        } else {
                          fs.copyFileSync(`${directory}/${hash}.${ext.extension}`, `audio/${hash}.${ext.extension}`);
                        }
                      })
                    }
                  }
                  let filename = template === 'preview' ? `${directory}/${hash}.preview.svg` : `${directory}/${hash}.svg`;
                  fs.readFile(filename, function(err, data) {

                      if(err) {
                          console.error(err);
                          return;
                      }
                      //svg optimize
                      console.log('svg pre optimized length', data.length)
                      svgo.optimize(data, {path: `${directory}/${hash}.preview.svg`}).then(function(result) {
                          fs.writeFileSync(`${directory}/${hash}.min.preview.svg`, result.data);
                          console.log('svg post optimized length', result.data.length);
                          let ret = new nunjucksEngine.runtime.SafeString(
                            minifyHtml(lilypondWrapper + `${result.data}` + audioMarkup)
                          )
                          if (param === 'inline') {
                            callback(null, ret);
                          } else {
                            fs.copyFileSync(`${directory}/${hash}.preview.svg`, `img/${hash}.svg`);
                            let ret = new nunjucksEngine.runtime.SafeString(
                              minifyHtml(lilypondWrapper + `<img src='/img/${hash}.svg' >` + audioMarkup)
                            )
                            callback(null, ret);
                          }
                      });
                  })
              });
          });
          }
      };
    }
  }

module.exports = {lilyaudioExtension};
