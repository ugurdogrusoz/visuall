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
        let nodeCol = $('<div class="col-6" id="filter-col-node"><b>Nodes</b><br></div>');
        let nodeAttr = $('<div><hr></div>');
        let edgeCol = $('<div class="col-6" id="filter-col-edge"><b>Edges</b><br></div>');
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

    bindClassFilterFunctionality(cb){
        $('.filter-btn').on('click', cb);
    }
}


// Handle Tab functionality
// Node & Edge classes

// Node properties for each class
// Edge properties for each class