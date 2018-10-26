let fs = require('fs');

// Check given inputs for filename
if(process.argv.length !== 3){
    console.log("Give model filename as input: \nnode style_generator.js {filename}");
    return;
}

const filename = process.argv[2];

read_file(filename, parse_model_description);


function parse_model_description(model) {
    const data = JSON.parse(model);
    const classes = data['classes'];
    const relations = data['relations'];
    const check = ['icon', 'label'];

    let stylesheet = [];
    for(let key in classes){
        let val = classes[key];
        let style = {
            selector: 'node.' + key,
            style: {}
        };

        for(let style_key in val['style']){
            if(check.includes(style_key))
                continue;

            style['style'][style_key] = val['style'][style_key];
        }

        stylesheet.push(style);
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
    }

    write_file('generated_stylesheet.txt', JSON.stringify(stylesheet));
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
        console.log("Invalid use of function!\nread_file(filename:string, cb:function)");
        return;
    }

    fs.writeFile(filename, content, function (err) {
        if(err)
            throw err;

        console.log(filename + " written successfully!");
    });
}