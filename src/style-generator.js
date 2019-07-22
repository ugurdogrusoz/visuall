let fs = require('fs');
const css = require('css');

// Check given inputs for filename
if (process.argv.length !== 3) {
  console.log(
      'Give model filename as input: \nnode style-generator.js {filename}');
  return;
}

const filename = process.argv[2];

const model = read_file(filename);
parse_model_description(model);


function parse_model_description(model) {
  const data = JSON.parse(model);

  const classes = data['classes'];
  const relations = data['relations'];

  let stylesheet = [];
  let properties = {nodes: {}, edges: {}};

  apply_general_styles(data);

  // Apply required fixed styles
  generate_fixed_styles(stylesheet, data['generalStyles']);

  // Generate stylesheet.json & properties.json for nodes and edges
  generate_node_styles(classes, stylesheet, properties);
  generate_edge_styles(relations, stylesheet, properties);

  // add overwrite styles, these should be written last to overwrite
  generate_fixed_styles(stylesheet, data['overwriteStyles']);
  // Beautify JSON output with 2 space tabs and write to file
  write_file(
      'assets/generated/stylesheet.json', JSON.stringify(stylesheet, null, 2));
  write_file(
      'assets/generated/properties.json', JSON.stringify(properties, null, 2));
}

function apply_general_styles(data) {
  const indexFileName = 'index.html';
  const cssFileName = 'styles.css';

  processCssFile(cssFileName, data.style);
  processIndexFile(indexFileName, data.template);
}

function processCssFile(cssFileName, style) {
  let cssFile = read_file(cssFileName);

  let ast = css.parse(cssFile);
  
  for (let [key, val] of Object.entries(style)) {
    for (let [cssKey, cssVal] of Object.entries(val)) {
      updateAST(ast, key, cssKey, cssVal);
    }
  }

  cssFile = css.stringify(ast);
  write_file(cssFileName, cssFile);
}

function processIndexFile(indexFileName, template) {
  let indexFile = read_file(indexFileName);

  // Insert name between <title>___</title>
  indexFile = indexFile.replace(/(?<=<title>)(.*?)(?=<\/title>)/, template.html_header);
  write_file(indexFileName, indexFile);
}

function generate_fixed_styles(stylesheet, generalStyles) {
  generalStyles.forEach(element => {
    stylesheet.push(element);
  });
}

function generate_node_styles(nodes, stylesheet, properties) {
  const check = ['icon'];

  for (let key in nodes) {
    let val = nodes[key];
    let style = {selector: 'node.' + key, style: {}};

    for (let style_key in val['style']) {
      if (check.includes(style_key)) {
        continue;
      }
      let styleVal = val['style'][style_key];
      if (isImageFilePath(styleVal)) {
        styleVal = encode2Base64(styleVal);
      }
      style['style'][style_key] = styleVal;
    }
    stylesheet.push(style);

    properties['nodes'][key] = val['properties'];
  }
}

function generate_edge_styles(edges, stylesheet, properties) {
  const check = ['icon'];

  for (let key in edges) {
    let val = edges[key];
    let style = {selector: 'edge.' + key, style: {}};

    for (let style_key in val['style']) {
      if (check.includes(style_key)) continue;

      style['style'][style_key] = val['style'][style_key];
    }

    stylesheet.push(style);

    properties['edges'][key] = val['properties'];
  }
}

function read_file(filename) {
  if (typeof filename !== 'string') {
    console.log('Invalid use of function!\nread_file(filename:string)');
    return;
  }

  return fs.readFileSync(filename, 'utf8');
}

function write_file(filename, content) {
  if (typeof filename !== 'string' || typeof content !== 'string') {
    console.log(
        'Invalid use of function!\nwrite_file(filename:string, content:string)');
    return;
  }

  fs.writeFile(filename, content, function(err) {
    if (err) throw err;

    console.log(filename + ' written successfully!');
  });
}

function escape_special_characters(string) {
  return string.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}

function isImageFilePath(filepath) {
  const s = filepath.toLowerCase();
  return s.endsWith('.png') || s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.svg');
}

function encode2Base64(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  
  return 'data:image/png;base64,' + Buffer.from(bitmap).toString('base64');
}

// ast is abstract syntax tree for style.css file 
function updateAST(ast, cssSelector, cssKey, cssVal) {
  for (let i = 0; i < ast.stylesheet.rules.length; i++) {
    let rule = ast.stylesheet.rules[i];
    if (!rule.selectors) {
      continue;
    }
    if (rule.selectors.find(x => x.includes(cssSelector))) {
      for (let j = 0; j < rule.declarations.length; j++) {
        let decl = rule.declarations[j];
        if (decl.property === cssKey) {
          ast.stylesheet.rules[i].declarations[j].value = cssVal;
        }
      }
    }
  }
}