import properties from "../assets/generated/properties";
import * as utils from "./utils";

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

        const warning = 'Multiple Instance.';

        let eles = event.target;
        let className;
        let props = {};
        eles.forEach(ele => {
            const data = ele.data();
            for(const key in data){
                if(props[key] && props[key] !== data[key])
                    props[key] = warning;
                else{
                    if(data[key] === 'default' && (key === "begin_date" || key === "end_date"))
                        props[key] = (key === "begin_date") ? "-∞" : "∞";
                    else
                        props[key] = data[key];
                }
            }

            const classes = ele.json().classes;
            if(!classes)
                return;

            for(const c of classes.split(' ')){
                if(className && className !== c)
                    className = warning;
                else
                    className = c;
            }
        });

        let propList = '<ul class="list-group list-group-flush">' +
            '<li class="list-group-item text-center"><b>' + className + '</b></li>';

        for(const key in props){
            propList += '<li class="list-group-item"><div class="row">' +
                '<div class="col-4 offset-2">' + utils.removeSpecialChars(key) + '</div>' +
                '<div class="col-6">' + props[key] + '</div></div></li>';
        }
        propList += '</ul><br>';

        $('#object').html(propList);
    }

    hideObjectProps(event){}
}


// Handle Tab functionality
// Node & Edge classes

// Node properties for each class
// Edge properties for each class