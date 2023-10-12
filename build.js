const StyleDictionaryPackage = require("style-dictionary");
const fs = require("fs");
const _ = require("lodash");

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED

function getStyleDictionaryConfig(brand, platform) {
  return {
    source: [
      `src/brands/${brand}/*.json`,
      "src/globals/**/*.json",
      //   `src/platforms/${platform}/*.json`,
    ],
    platforms: {
      "web/js": {
        transformGroup: "tokens-js",
        buildPath: `output/web/${brand}/`,
        prefix: "token",
        files: [
          // uncomment these ones if you need to generate more formats
          // {
          //     "destination": "tokens.module.js",
          //     "format": "javascript/module"
          // },
          // {
          //     "destination": "tokens.object.js",
          //     "format": "javascript/object"
          // },
          {
            destination: "tokens.es6.js",
            format: "javascript/es6",
          },
        ],
      },
      "web/json": {
        transformGroup: "tokens-json",
        buildPath: `output/web/${brand}/`,
        prefix: "token",
        files: [
          {
            destination: "tokens.json",
            format: "json/flat",
          },
        ],
      },
      "web/scss": {
        transformGroup: "tokens-scss",
        buildPath: `output/web/${brand}/`,
        prefix: "token",
        files: [
          {
            destination: "tokens.scss",
            format: "scss/variables",
          },
        ],
      },
      styleguide: {
        transformGroup: "styleguide",
        buildPath: `output/styleguide/`,
        prefix: "token",
        files: [
          {
            destination: `${platform}_${brand}.json`,
            format: "json/flat",
          },
          {
            destination: `${platform}_${brand}.scss`,
            format: "scss/variables",
          },
        ],
      },
      // there are different possible formats for iOS (JSON, PLIST, etc.) so you will have to agree with the iOS devs which format they prefer
      ios: {
        // I have used custom formats for iOS but keep in mind that Style Dictionary offers some default formats/templates for iOS,
        // so have a look at the documentation before creating custom templates/formats, maybe they already work for you :)
        transformGroup: "tokens-ios",
        buildPath: `output/ios/${brand}/`,
        prefix: "token",
        files: [
          {
            destination: "tokens-all.plist",
            format: "ios/plist",
          },
          {
            destination: "tokens-colors.plist",
            format: "ios/plist",
            filter: {
              type: "color",
            },
          },
        ],
      },
      android: {
        // I have used custom formats for Android but keep in mind that Style Dictionary offers some default formats/templates for Android,
        // so have a look at the documentation before creating custom templates/formats, maybe they already work for you :)
        transformGroup: "tokens-android",
        buildPath: `output/android/${brand}/`,
        prefix: "token",
        files: [
          {
            destination: "tokens-all.xml",
            format: "android/xml",
          },
          {
            destination: "tokens-colors.xml",
            format: "android/xml",
            filter: {
              type: "color",
            },
          },
        ],
      },
      flutter: {
        transformGroup: "tokens-flutter",
        buildPath: `output/flutter/${brand}/`,
        // prefix: "token",
        files: [
          {
            destination: "borders.dart",
            format: "flutter/class",
            className: "FhBorders",
            filter: {
              category: "borderWidth",
            },
          },
          {
            destination: "colors.dart",
            format: "flutter/class",
            className: "FhColors",
            filter: {
              attributes: {
                category: "color",
              },
            },
          },
          {
            destination: "dimensions.dart",
            format: "flutter/dimensions",
            className: "FhDimensions",
            filter: {
              attributes: {
                category: "spacing",
              },
            },
          },
          {
            destination: "gradients.dart",
            format: "flutter/class",
            className: "FhGradients",
            filter: {
              category: "color",
            },
          },
          {
            destination: "radii.dart",
            format: "flutter/radii",
            className: "FhRadii",
            filter: {
              attributes: {
                category: "radii",
              },
            },
          },
          {
            destination: "shadows.dart",
            format: "flutter/class",
            className: "FhShadows",
            filter: {
              category: "shadow",
            },
          },
          {
            destination: "text_styles.dart",
            format: "flutter/textStyles",
            className: "FhTextStyles",
            filter: {
              attributes: {
                category: "typography",
              },
            },
          },
        ],
      },
    },
  };
}

// REGISTER CUSTOM FORMATS + TEMPLATES + TRANSFORMS + TRANSFORM GROUPS

// if you want to see the available pre-defined formats, transforms and transform groups uncomment this
// console.log(StyleDictionaryPackage);

StyleDictionaryPackage.registerFormat({
  name: "json/flat",
  formatter: function (dictionary) {
    return JSON.stringify(dictionary.allProperties, null, 2);
  },
});

StyleDictionaryPackage.registerFormat({
  name: "ios/plist",
  formatter: _.template(fs.readFileSync("templates/ios-plist.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "android/xml",
  formatter: _.template(fs.readFileSync("templates/android-xml.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "android/colors",
  formatter: _.template(fs.readFileSync("templates/android-xml.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "flutter/class",
  formatter: _.template(fs.readFileSync("templates/class-dart.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "flutter/dimensions",
  formatter: _.template(fs.readFileSync("templates/dimensions-dart.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "flutter/radii",
  formatter: _.template(fs.readFileSync("templates/radii-dart.template")),
});

StyleDictionaryPackage.registerFormat({
  name: "flutter/textStyles",
  formatter: _.template(fs.readFileSync("templates/text-styles-dart.template")),
});

// I wanted to use this custom transform instead of the "prefix" property applied to the platforms
// because I wanted to apply the "token" prefix only to actual tokens and not to the aliases
// but I've found out that in case of "name/cti/constant" the prefix was not respecting the case for the "prefix" part
//
// StyleDictionaryPackage.registerTransform({
//     name: 'name/prefix-token',
//     type: 'name',
//     matcher: function(prop) {
//         return prop.attributes.category !== 'alias';
//     },
//     transformer: function(prop) {
//         return `token-${prop.name}`;
//     }
// });

StyleDictionaryPackage.registerTransform({
  name: "size/pxToPt",
  type: "value",
  matcher: function (prop) {
    return prop.value.match(/^[\d.]+px$/);
  },
  transformer: function (prop) {
    return prop.value.replace(/px$/, "pt");
  },
});

StyleDictionaryPackage.registerTransform({
  name: "size/pxToDp",
  type: "value",
  matcher: function (prop) {
    return prop.value.match(/^[\d.]+px$/);
  },
  transformer: function (prop) {
    return prop.value.replace(/px$/, "dp");
  },
});

StyleDictionaryPackage.registerTransformGroup({
  name: "styleguide",
  transforms: ["attribute/cti", "name/cti/kebab", "size/px", "color/css"],
});

StyleDictionaryPackage.registerTransformGroup({
  name: "tokens-js",
  transforms: ["name/cti/constant", "size/px", "color/hex"],
});

StyleDictionaryPackage.registerTransformGroup({
  name: "tokens-json",
  transforms: ["attribute/cti", "name/cti/kebab", "size/px", "color/css"],
});

StyleDictionaryPackage.registerTransformGroup({
  name: "tokens-scss",
  // to see the pre-defined "scss" transformation use: console.log(StyleDictionaryPackage.transformGroup['scss']);
  transforms: ["name/cti/kebab", "time/seconds", "size/px", "color/css"],
});

StyleDictionaryPackage.registerTransformGroup({
  name: "tokens-ios",
  // to see the pre-defined "ios" transformation use: console.log(StyleDictionaryPackage.transformGroup['ios']);
  transforms: ["attribute/cti", "name/cti/camel", "size/pxToPt"],
});

StyleDictionaryPackage.registerTransformGroup({
  name: "tokens-android",
  // to see the pre-defined "android" transformation use: console.log(StyleDictionaryPackage.transformGroup['android']);
  transforms: ["attribute/cti", "name/cti/camel", "size/pxToDp"],
});

StyleDictionaryPackage.transformGroup["android"];

console.log("Build started...");

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS

["web", "ios", "android"].map(function (platform) {
  ["brand#1", "brand#2", "brand#3"].map(function (brand) {
    console.log("\n==============================================");
    console.log(`\nProcessing: [${platform}] [${brand}]`);

    const StyleDictionary = StyleDictionaryPackage.extend(
      getStyleDictionaryConfig(brand, platform)
    );

    if (platform === "web") {
      StyleDictionary.buildPlatform("web/js");
      StyleDictionary.buildPlatform("web/json");
      StyleDictionary.buildPlatform("web/scss");
    } else if (platform === "ios") {
      StyleDictionary.buildPlatform("ios");
    } else if (platform === "android") {
      StyleDictionary.buildPlatform("android");
    }
    StyleDictionary.buildPlatform("styleguide");

    console.log("\nEnd processing");
  });
});

console.log("\n==============================================");
console.log("\nBuild completed!");
