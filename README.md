# Visu*all* - convenient construction of a web based visual analysis component

Visu*all* is a library or template to *jump start* software developers in building a visual web based component for analysis of relational information represented as a graph.

The library assumes a certain graphical user interface with utmost flexibility for customization. Hence, all components of the GUI from menus to toolbar to panels as well as the canvas are customizable. Most customization can be done via [a model description file](src/app/custom/config/app_description.json).

## License

Visu*all* is **not** an open source or free software. Please contact [i-Vis Research Lab](http://www.cs.bilkent.edu.tr/~ivis/) for terms of use of this software.

## Running a local instance

`npm install` for loading dependencies

`node style-generator.js {application description filename}` to generate customized application, this changes [styles.css](src/styles.css) and [index.html](src/index.html). Notice that the application description file is inside the `assets` folder.

`npm run ng serve` for development and debugging

`npm run serve-public` for making development server accesible on network

`npm run ng test` for unit tests

`npm run ng build` to generate a production build, `npm run build-prod` to generate a minified, uglified production build

`npm run ng build` and `npm run build-prod` commands generate files inside ***dist\ng-visuall*** folder. An HTTP server should serve these files. You should use [server.js](server.js) file to run a server with command `node server.js`. 

## User Guide

A User Guide for the sample application of Visu*all* can be found [here](https://docs.google.com/document/d/1YAl43m63T1Zovi-yOQECWyr8_o9hWkMUN6TlcGdk63Y). An application based on Visu*all* could naturally base their User Guide on this guide.

## Developer Guide

A Developer Guide that details how a custom application can be built using  Visu*all* can be found [here](https://docs.google.com/document/d/1Sk4Xy4hJnYsmevef9e6lcHt_6a0nKkf8eJuEdiU6W6Q).

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
