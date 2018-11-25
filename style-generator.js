let fs = require('fs');

// Check given inputs for filename
if(process.argv.length !== 3){
    console.log("Give model filename as input: \nnode style-generator.js {filename}");
    return;
}

const filename = process.argv[2];

read_file(filename, parse_model_description);


function parse_model_description(model) {
    const data = JSON.parse(model);
    const classes = data['classes'];
    const relations = data['relations'];
    const check = ['icon'];

    let stylesheet = [];
    let properties = {
        nodes: {},
        edges: {}
    };

    // Apply required fixed styles
    stylesheet.push({
        selector: '.hidden',
        style: {
            'display': 'none'
        }
    });

    for(let key in classes){
        let val = classes[key];
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

    for(let key in relations){
        let val = relations[key];
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

    // Beautify JSON output with 4 space tabs and write to file
    write_file('assets/generated/stylesheet.json', JSON.stringify(stylesheet, null, 4));
    write_file('assets/generated/properties.json', JSON.stringify(properties, null, 4));
}

function read_file(filename, cb) {
    if (typeof filename !== "string" || typeof cb !== "function"){
        console.log("Invalid use of function!\nread_file(filename:string, cb:function)");
        return;
    }

    fs.readFile(filename, 'utf8', function (err, data) {
        if(err)
            throw err;

        console.log(filename + " read successfully!");
        return cb(data);
    });
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