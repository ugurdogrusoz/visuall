let fs = require('fs');

// Check given inputs for filename
if(process.argv.length !== 3){
    console.log("Give model filename as input: \nnode style-generator.js {filename}");
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
    let properties = {
        nodes: {},
        edges: {}
    };

    apply_general_styles(data);

    // Apply required fixed styles
    generate_fixed_styles(stylesheet);

    // Generate stylesheet.json & properties.json for nodes and edges
    generate_node_styles(classes, stylesheet, properties);
    generate_edge_styles(relations, stylesheet, properties);

    // Beautify JSON output with 4 space tabs and write to file
    write_file('assets/generated/stylesheet.json', JSON.stringify(stylesheet, null, 4));
    write_file('assets/generated/properties.json', JSON.stringify(properties, null, 4));
}

function apply_general_styles(data){
    const indexFileName = 'index.html';

    const name = data['name'];
    const icon = data['icon'];

    let indexFile = read_file(indexFileName);

    // Insert name between <title>___</title>
    indexFile = indexFile.replace(/(?<=<title>)(.*?)(?=<\/title>)/, name);
    // Insert name between <b id="tool-name">___</b>
    indexFile = indexFile.replace(/(?<=<b id="tool-name">)(.*?)(?=<\/b>)/, name);

    // Insert icon <img id="tool-logo" src="___">
    indexFile = indexFile.replace(/(?<=id="tool-logo" src=")(.*?)(?=")/, icon);

    write_file(indexFileName, indexFile);
}

function generate_fixed_styles(stylesheet){
    stylesheet.push({
        selector: '.hidden',
        style: {
            'display': 'none'
        }
    });
}

function generate_node_styles(nodes, stylesheet, properties){
    const check = ['icon'];

    for(let key in nodes){
        let val = nodes[key];
        let style = {
            selector: 'node.' + key,
            style: {}
        };

        for(let style_key in val['style']){
            if(check.includes(style_key)){
                continue;
            }

            style['style'][style_key] = val['style'][style_key];
        }
        stylesheet.push(style);

        properties['nodes'][key] = val['properties'];
    }
}

function generate_edge_styles(edges, stylesheet, properties){
    const check = ['icon'];

    for(let key in edges){
        let val = edges[key];
        let style = {
            selector: 'edge.' + key,
            style: {}
        };

        for(let style_key in val['style']){
            if(check.includes(style_key))
                continue;

            style['style'][style_key] = val['style'][style_key];
        }

        stylesheet.push(style);

        properties['edges'][key] = val['valid_ends'];
    }
}

function read_file(filename) {
    if (typeof filename !== "string"){
        console.log("Invalid use of function!\nread_file(filename:string)");
        return;
    }

    return fs.readFileSync(filename, 'utf8');
}

function write_file(filename, content) {
    if (typeof filename !== "string" || typeof content !== "string"){
        console.log("Invalid use of function!\nwrite_file(filename:string, content:string)");
        return;
    }

    fs.writeFile(filename, content, function (err) {
        if(err)
            throw err;

        console.log(filename + " written successfully!");
    });
}