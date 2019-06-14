const SVGO = require('svgo')

const svgo = new SVGO({
    plugins: [{
        cleanupAttrs: true,
      }, {
        removeAttrs: { attrs: 'xlink.*'},
      }, {
        removeDoctype: true,
      },{
        removeXMLProcInst: true,
      },{
        removeComments: true,
      },{
        removeMetadata: true,
      },{
        removeEditorsNSData: true,
      },{
        removeTitle: true,
      },{
        removeDesc: true,
      },{
        removeUselessDefs: true,
      },{
        removeEditorsNSData: true,
      },{
        removeEmptyAttrs: true,
      },{
        removeHiddenElems: true,
      },{
        removeEmptyText: true,
      },{
        removeEmptyContainers: true,
      },{
        removeViewBox: false,
      },{
        removeXMLNS: true,
      },{
        cleanupEnableBackground: true,
      },{
        convertStyleToAttrs: true,
      },{
        convertColors: true,
      },{
        convertPathData: true,
      },{
        convertTransform: true,
      },{
        removeUnknownsAndDefaults: true,
      },{
        removeNonInheritableGroupAttrs: true,
      },{
        removeUselessStrokeAndFill: true,
      },{
        removeUnusedNS: true,
      },{
        cleanupIDs: true,
      },{
        cleanupNumericValues: true,
      },{
        moveElemsAttrsToGroup: true,
      },{
        moveGroupAttrsToElems: true,
      },{
        collapseGroups: true,
      },{
        removeRasterImages: false,
      },{
        mergePaths: true,
      },{
        convertShapeToPath: true,
      },{
        sortAttrs: true,
      },{
        removeDimensions: true,
}]
})

module.exports = { svgo }

