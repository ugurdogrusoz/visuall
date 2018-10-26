const stylesheet = loadFile('generated_stylesheet.txt');

let cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        {
            data: {
                id: 'ab',
                source: 'a',
                target: 'b'
            }
        }],
    style: stylesheet
});


function loadFile(filePath) {
    let result = null;
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();

    if (xmlhttp.status === 200) {
        result = xmlhttp.responseText;
    }
    return result;
}