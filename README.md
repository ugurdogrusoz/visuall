# Visu*all* - convenient construction of a web based visual analysis component

Visu*all* is a library or template to *jump start* software developers in building a visual web based component for analysis of relational information represented as a graph.

The library assumes a certain graphical user interface with utmost flexibility for customization. Hence, all components of the GUI from menus to toolbar to panels as well as the canvas are customizable. Most customization can be done via [a model description file](src/model_description.json).

## License

Visu*all* is **not** an open source or free software. Please contact [i-Vis Research Lab](http://www.cs.bilkent.edu.tr/~ivis/) for terms of use of this software.

## Running a local instance

node style-generator.js {model description filename}
to generate customized application, it changes styles.css and index.html

`ng serve` for development and debugging

`ng serve --host 0.0.0.0` for making development server accesible on network

`ng test` for unit tests

`ng build` to generate a production build 

`ng build --prod` to generate a minified, uglified production build

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
[Backbone](https://github.com/jashkenas/backbone),
[Bootstrap](https://github.com/twbs/bootstrap),
[FileSaver.js](https://github.com/eligrey/FileSaver.js),
[jQuery](https://github.com/jquery/jquery),
[jquery-expander](https://github.com/kswedberg/jquery-expander),
[Konva](https://github.com/konvajs/konva),
[Libxmljs](https://github.com/libxmljs/libxmljs),
[lodash](https://github.com/lodash/lodash),
[underscore](https://github.com/jashkenas/underscore),
[express](https://github.com/expressjs/express),
[browserify](https://github.com/browserify/browserify),
[nodemon](https://github.com/remy/nodemon),
[chroma-js](https://github.com/gka/chroma.js) licensed with [BSD](https://opensource.org/licenses/BSD-3-Clause); 
[Parallel Shell](https://github.com/darkguy2008/parallelshell),
[Tippyjs](https://github.com/atomiks/tippyjs) licensed with [MIT](https://opensource.org/licenses/MIT);
[Mousetrap](https://github.com/ccampbell/mousetrap),
[Request](https://github.com/request/request) licensed with [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) and
[Intro.js](https://github.com/usablica/intro.js) licensed with [GNU LGPL](https://www.gnu.org/licenses/lgpl-3.0.html).

## About

Visu*all* is being developed by [i-Vis Research Lab](http://www.cs.bilkent.edu.tr/~ivis/) at Bilkent University.
