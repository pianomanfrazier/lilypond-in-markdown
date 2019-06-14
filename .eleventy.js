/* eslint-disable max-len */
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const htmlmin = require('html-minifier');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const md5 = require('crypto-js/md5');
const fs = require('fs');
const {exec} = require('child_process');
const {svgo} = require('./svgoConfig');
const {lilypondExtension} = require('./lilypondExtension');
const {lilycodeExtension} = require('./lilycodeExtension');

// Setup up typography
const Typography = require('typography');
const theme = require('typography-theme-lincoln').default;
// const theme = require('typography-theme-funston');
const typography = new Typography(theme);

// used to minify the svg output of Lilypond
const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true,
});

module.exports = function(eleventyConfig) {

  eleventyConfig.addFilter('cssmin', function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter('jsmin', function(code) {
    const minified = UglifyJS.minify(code);
    if ( minified.error ) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Inject the typography into the page
  eleventyConfig.addShortcode('typography', () => {
    return `<style type="text/css">${typography.toString()}</style>`;
  });
  eleventyConfig.addShortcode('typographyFonts', () => {
    googleFonts = theme.googleFonts;
    const fonts = [];
    for (const i in googleFonts) {
      if (Object.prototype.hasOwnProperty.call(googleFonts, i)) {
        const name = googleFonts[i].name.replace(/\s/g, '+');
        const tempString = `${name}:${googleFonts[i].styles.join(',')}`;
        fonts.push(tempString);
      }
    }
    return `<link href="https://fonts.googleapis.com/css?family=${fonts.join('|')}" rel="stylesheet">`;
  });

  // custom tags for processing lilypond
  eleventyConfig.addNunjucksTag('lilycode', lilycodeExtension);
  eleventyConfig.addNunjucksTag('lilypond', lilypondExtension);

  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('audio');

  /* Markdown Plugins */
  const markdownIt = require('markdown-it');
  const emoji = require('markdown-it-emoji');
  const options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
  };

  eleventyConfig.setLibrary('md', markdownIt(options)
      .use(emoji)
  );

  return {
    templateFormats: [
      'md',
      'njk',
      'html',
    ],

    pathPrefix: '/',

    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
