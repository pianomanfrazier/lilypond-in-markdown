const htmlmin = require("html-minifier");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const MD5 = require("crypto-js/md5")
const fs = require('fs')
const { exec } = require('child_process')
const { svgo } = require("./LilypondExtension")

// Setup up typography
const Typography = require('typography');
const theme = require('typography-theme-lincoln');
const typography = new Typography(theme);

// used to minify the svg output of Lilypond
const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true
});

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  // Inject the typography into the page
  eleventyConfig.addShortcode('typography', () => {
    return `<style type="text/css">${typography.toString()}</style>`;
  });
  eleventyConfig.addShortcode("typographyFonts", () => {
    let fonts = []
    for (let i in theme.googleFonts) {
      let name = theme.googleFonts[i].name.replace(/\s/g, "+");
      let tempString = `${name}:${theme.googleFonts[i].styles.join(',')}`;
      fonts.push(tempString);
    }
    return `<link href="https://fonts.googleapis.com/css?family=${fonts.join('|')}" rel="stylesheet">`;
  });

  // The Lilypond extension
  eleventyConfig.addNunjucksTag("lilypond", function(nunjucksEngine) {
    return new function() {
      this.tags = ['lilypond'];
      this.parse = function(parser, nodes, lexer) {
          var tok = parser.nextToken();
          var args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);
          var body = parser.parseUntilBlocks('endlilypond');
          parser.advanceAfterBlockEnd();
          return new nodes.CallExtensionAsync(this, 'run', args, [body]);
      };
      this.run = function(context, param, template, height, body, callback) {
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
          let hash = MD5(tempString + template);
          let lilypondOpen = `<div class="lilypond">`;
          let lilypondClose = `</div>`
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
                  let ret = new nunjucksEngine.runtime.SafeString(minifyHtml(lilypondOpen + String(data) + lilypondClose));
                  callback(null, ret);
              })
            } else {
                let ret = new nunjucksEngine.runtime.SafeString(
                  minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
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
                            minifyHtml(lilypondOpen + `${result.data}` + lilypondClose)
                          )
                          if (param === 'inline') {
                            callback(null, ret);
                          } else {
                            fs.copyFileSync(`${directory}/${hash}.preview.svg`, `img/${hash}.svg`);
                            let ret = new nunjucksEngine.runtime.SafeString(
                              minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
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
  })

  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let emoji = require("markdown-it-emoji");
  let options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(emoji)
  );

  return {
    templateFormats: [
      "md",
      "njk",
      "html"
    ],

    pathPrefix: "/",

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
