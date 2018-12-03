import properties from "../assets/generated/properties";


export default class TabManager {

    constructor(){
        this.initProperties(properties);

        this.initFilterTab();
    }

    initProperties(properties){
        this.nodeProperties = properties.nodes;
        this.edgeProperties = properties.edges;
    }

    initFilterTab(){
        const nodeProps = this.nodeProperties;
        const edgeProps = this.edgeProperties;

        let filterRow = $('<div class="row"></div>');
        let nodeCol = $('<div class="col-6" id="filter-col-node"><p class="text-center">Nodes</p></div>');
        let nodeAttr = $('<div><hr></div>');
        let edgeCol = $('<div class="col-6" id="filter-col-edge"><p class="text-center">Edges</p></div>');
        let edgeAttr = $('<div><hr></div>');

        // Generate filter elements for node properties
        for(const prop in nodeProps){
            let filterBtn = $('<input type="button" class="btn btn-info filter-btn">');
            filterBtn.prop({
                id: prop + 'Check',
                value: prop
            });

            nodeCol.append(filterBtn);
        }

        // Generate filter elements for edge properties
        for(const prop in edgeProps){
            let filterBtn = $('<input type="button" class="btn btn-info filter-btn">');
            filterBtn.prop({
                id: prop + 'Check',
                value: prop
            });

            edgeCol.append(filterBtn);
        }

        nodeCol.append(nodeAttr);
        edgeCol.append(edgeAttr);
        filterRow.append(nodeCol, edgeCol);
        $('#filter').append(filterRow);
    }

    bindFilterByClassFunctionality(cb){
        $('.filter-btn').on('click', cb);
    }

    showObjectProps(event){
        $('#object-tab').click();

        let props = getCommonObjectProps(event.target);

        let htmlToRender = renderCommonObjectProps(props);

        $('#object').html(htmlToRender);
    }

    hideObjectProps(event){}
}

function getCommonObjectProps(eleList){
    let props = {};
    let initProps = {};

    // Assume ele is instance of Cytoscape.js element
    eleList.forEach(ele => {
        const data = ele.data();

        // Get common object properties
        for(const key in data){
            if(!initProps[key]){
                props[key] = data[key];
                initProps[key] = true;
            }
            else if(props[key] && props[key] !== data[key]){
                delete props.key;
            }
        }

        let classes = ele.json().classes;
        if(!classes){
            initProps.classNames = true;
            return;
        }

        classes = classes.split(' ');

        // Initialize common classNames array
        if(!initProps.classNames){
            props.classNames = classes;
            initProps.classNames = true;
            return;
        }

        // Get common object classes
        for(let c = 0; c < classes.length; c++){
            if(!props.classNames.includes(classes[c]))
                classes.splice(c, 1);
        }
    });

    return props;
}

function renderCommonObjectProps(props){
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

    return propList;
}

// Handle Tab functionality
// Node & Edge classes

// Node properties for each class
// Edge properties for each class