# Visu*all* - convenient construction of a web based visual analysis component

Visu*all* is a library or template to *jump start* software developers in building a visual web based component for analysis of relational information represented as a graph.

The library assumes a certain graphical user interface with utmost flexibility for customization. Hence, all components of the GUI from menus to toolbar to panels as well as the canvas are customizable. Most customization can be done via [a model description file](src/model_description.json).

## License

Visu*all* is **not** an open source or free software. Please contact [i-Vis Research Lab](http://www.cs.bilkent.edu.tr/~ivis/) for terms of use of this software.

## Running a local instance

`node style-generator.js {model description filename}` to generate customized application, it changes styles.css and index.html

`ng serve` for development and debugging

`ng serve --host 0.0.0.0` for making development server accesible on network

`ng test` for unit tests

`ng build` to generate a production build 

`ng build --prod` to generate a minified, uglified production build

`node server.js` to start the server

## User Guide

A User Guide for the sample application of Visu*all* can be found [here](UG.md). An application based on Visu*all* could naturally base their User Guide on this guide.

## Developer Guide

A Developer Guide that details how a custom application can be built using  Visu*all* can be found [here](DG.md).

## Credits

Icons made by [Freepik](http://www.freepik.com), 
[Daniel Bruce](http://www.flaticon.com/authors/daniel-bruce), 
[TutsPlus](http://www.flaticon.com/authors/tutsplus),
[Robin Kylander](http://www.flaticon.com/authors/robin-kylander),
[Catalin Fertu](http://www.flaticon.com/authors/catalin-fertu),
[Yannick](http://www.flaticon.com/authors/yannick),
[Icon Works](http://www.flaticon.com/authors/icon-works),
[Flaticon](http://www.flaticon.com) and licensed with 
[Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/)

Third-party libraries:
[Cytoscape.js](https://github.com/cytoscape/cytoscape.js) and many of its extensions,
[Angular](https://angular.io/),
[Google Charts](https://developers.google.com/chart/) and npm dependecies inside package.json file.

For database it uses free and openly available Neo4j movie database. It can be installed using `:play movies` on **Neo4j Browser**
## About

Visu*all* is being developed by [i-Vis Research Lab](http://www.cs.bilkent.edu.tr/~ivis/) at Bilkent University.
