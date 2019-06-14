
const htmlmin = require('html-minifier');
const md5 = require('crypto-js/md5');
const fs = require('fs');
const {exec} = require('child_process');

const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true,
});

// The LilyPond Syntax highlight extension
// pass source code to python-ly for syntax highlighting
function lilycodeExtension(nunjucksEngine) {
  return new function() {
    this.tags = ['lilycode'];
    this.parse = function(parser, nodes, lexer) {
      const tok = parser.nextToken();
      const args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      const body = parser.parseUntilBlocks('endlilycode');
      parser.advanceAfterBlockEnd();
      return new nodes.CallExtensionAsync(this, 'run', args, [body]);
    };
    this.run = function(context, body, callback) {
      // TODO: change all sync calls to async
      const directory = `_lilycode`;
      const files = fs.readdirSync(`${directory}`);
      const hash = md5(body());
      let isCached = false;
      for (const i in files) {
        if (files[i] === `${hash}.html`) {
          isCached = true;
        }
      }
      if (isCached) {
        fs.readFile(`${directory}/${hash}.html`, function(err, data) {
          if (err) {
            console.error(err);
            return;
          }
          const ret = new nunjucksEngine.runtime.SafeString(minifyHtml(String(data)));
          callback(null, ret);
        });
      } else {
        // characters getting escaped on command line
        fs.writeFileSync(`${directory}/${hash}.ly`, body().trim());
        const execString = `ly highlight ${directory}/${hash}.ly -d full_html=false -d wrapper_tag=code -d document_id=language-lilypond`;
        exec(execString, function(err, stdout, stderr) {
          if (err) {
            console.error(err);
            return;
          }
          console.error(stderr);
          const formatedHtml = `<pre class="language-lilypond">${stdout}</pre>`;
          fs.writeFileSync(`${directory}/${hash}.html`, formatedHtml);
          const ret = new nunjucksEngine.runtime.SafeString(formatedHtml);
          callback(null, ret);
        });
      }
    };
  };
}

module.exports = {lilycodeExtension};
