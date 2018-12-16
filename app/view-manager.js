

export default class ViewManager{

    constructor(appManager){
        this.appManager = appManager;
    }

    initFilterTabView(nodeProps, edgeProps) {
        let filterRow = $('<div class="row"></div>');
        let nodeCol = $('<div class="col-6" id="filter-col-node"><p class="text-center">Nodes</p></div>');
        let edgeCol = $('<div class="col-6" id="filter-col-edge"><p class="text-center">Edges</p></div>');

        let nodeAttrList = [];
        let edgeAttrList = [];

        // Generate filter elements for node properties
        for(const prop in nodeProps){
            const filterBtn = generateClassFilterBtn(prop);
            nodeCol.append(filterBtn);

            for(const attr in nodeProps[prop]){
                if(!nodeAttrList.includes(attr))
                    nodeAttrList.push(attr);
            }
        }

        // Generate filter elements for edge properties
        for(const prop in edgeProps){
            const filterBtn = generateClassFilterBtn(prop);
            edgeCol.append(filterBtn);

            edgeAttrList.push(prop);
        }

        const nodeAttr = this.generateNodeAttrFilter(nodeAttrList);

        nodeCol.append(nodeAttr);
        filterRow.append(nodeCol, edgeCol);
        $('#filter').append(filterRow);
    }

    renderObjectProps(props) {
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

    generateNodeAttrFilter(props){
        let nodeAttr = $('<div id="nodeAttributes" class="text-center"><hr><p class="text-center">Filter by Node Attribute</p></div>');

        const dropdown = generateAttrFilterDropdown(props);
        const input = $('<input type="text" id="node-attr-input" class="form-control filter-form" placeholder="Filter...">');
        const btn = $('<button type="button" class="btn btn-outline-info">Add Rule</button>');
        btn.click(() => this.generateNewRule());

        const ruleList = $('<br><br><ul id="node-filter-rules" class="list-group list-group-flush"></ul>');

        nodeAttr.append(dropdown, input, btn, ruleList);
        return nodeAttr;
    }

    generateNewRule(){
        const prop = $('#node-attr-dropdown option:selected').val();
        const val = $('#node-attr-input').val();

        if(!prop || !val)
            return;

        const ruleID = this.appManager.createFilterRule(prop, val);

        const res = $('<li id="' + ruleID + '" class="list-group-item">' + prop + ': ' + val + '</li>');
        const deleteBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        deleteBtn.click(() => this.appManager.deleteFilterRule(ruleID));

        res.append(deleteBtn);
        $('#node-filter-rules').append(res);
    }
}

function generateClassFilterBtn(className) {
    let filterBtn = $('<input type="button" class="btn btn-info filter-btn">');
    filterBtn.prop({
        id: className + 'Check',
        value: className
    });
    return filterBtn;
}

function generateAttrFilterDropdown(props){
    let dropdown = $('<select id="node-attr-dropdown" class="custom-select filter-form"></select>');
    props.forEach(prop => {
        let option = $('<option value="' + prop + '">' + prop + '</option>');
        dropdown.append(option);
    });
    return dropdown;
}