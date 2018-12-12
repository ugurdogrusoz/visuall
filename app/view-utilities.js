

export function initFilterTabView(nodeProps, edgeProps) {
    let filterRow = $('<div class="row"></div>');
    let nodeCol = $('<div class="col-6" id="filter-col-node"><p class="text-center">Nodes</p></div>');
    let nodeAttr = $('<div><hr></div>');
    let edgeCol = $('<div class="col-6" id="filter-col-edge"><p class="text-center">Edges</p></div>');
    let edgeAttr = $('<div><hr></div>');

    // Generate filter elements for node properties
    for(const prop in nodeProps){
        const filterBtn = generateClassFilterBtn(prop);
        nodeCol.append(filterBtn);
    }

    // Generate filter elements for edge properties
    for(const prop in edgeProps){
        const filterBtn = generateClassFilterBtn(prop);
        edgeCol.append(filterBtn);
    }

    nodeCol.append(nodeAttr);
    edgeCol.append(edgeAttr);
    filterRow.append(nodeCol, edgeCol);
    $('#filter').append(filterRow);
}

export function renderObjectProps(props) {
    let classNames = "";
    if(props.classNames && props.classNames.length > 0)
        classNames = props.classNames.join(' & ');

    let propList = '<ul class="list-group list-group-flush">' +
        '<li class="list-group-item text-center"><b>' + classNames + '</b></li>';

    for(const key in props){
        if(key === 'classNames')
            continue;

        // Replace - and _ with space
        let renderedKey = key.replace(/[_\-]/g, " ");
        let renderedValue = props[key];

        if(renderedValue instanceof Date){
            const options = { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' };
            renderedValue = renderedValue.toLocaleDateString('en-EN', options);
        }

        propList += '<li class="list-group-item"><div class="row">' +
            '<div class="col-4 offset-2">' + renderedKey + '</div>' +
            '<div class="col-6">' + renderedValue + '</div></div></li>';
    }
    propList += '</ul><br>';

    $('#object').html(propList);
}

function generateClassFilterBtn(className) {
    let filterBtn = $('<input type="button" class="btn btn-info filter-btn">');
    filterBtn.prop({
        id: className + 'Check',
        value: className
    });
    return filterBtn;
}