

export default class ViewManager{

    constructor(appManager){
        this.appManager = appManager;
    }

    init(){}

    initFilterTabView(nodeProps, edgeProps) {
        let nodeClassDiv = $('#filter-node-class');
        let edgeClassDiv = $('#filter-edge-class');
        let nodeAttrDiv = $('#filter-node-attr');

        let nodeAttrList = [];
        let edgeAttrList = [];

        // Generate filter elements for node properties
        for(const prop in nodeProps){
            const filterBtn = createFilterBtn(prop);
            filterBtn.on('click', event => this.appManager.filterElesByClass(event));
            nodeClassDiv.append(filterBtn);

            for(const attr in nodeProps[prop]){
                if(!nodeAttrList.includes(attr))
                    nodeAttrList.push(attr);
            }
        }

        // Generate filter elements for edge properties
        for(const prop in edgeProps){
            const filterBtn = createFilterBtn(prop);
            filterBtn.on('click', event => this.appManager.filterElesByClass(event));
            edgeClassDiv.append(filterBtn);

            edgeAttrList.push(prop);
        }

        const attrDropdown = createAttrDropdown(nodeAttrList);
        const attrInput = createAttrInput();
        const addRuleBtn = createAddRuleBtn();
        addRuleBtn.on('click', () => this.addNewRule());

        nodeAttrDiv.append(attrDropdown, attrInput, addRuleBtn);
    }

    addNewRule(){
        const prop = $('#node-attr-dropdown option:selected').val();
        const val = $('#node-attr-input').val();

        if(!prop || !val)
            return;

        const ruleId = this.appManager.createFilterRule(prop, val);

        const listItem = createRuleItem(ruleId, prop, val);
        const deleteBtn = createDeleteRuleBtn();
        deleteBtn.click(() => this.appManager.deleteFilterRule(ruleId));

        listItem.append(deleteBtn);
        $('#filter-node-rules').append(listItem);
    }

    renderObjectProps(props) {
        let classNames = "";
        if(props.classNames && props.classNames.length > 0)
            classNames = props.classNames.join(' & ');

        $('#object-class-name').text(classNames);

        let propList = $('#object-prop-list');
        propList.empty();

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

            const propItem = createObjectPropItem(renderedKey, renderedValue);
            propList.append(propItem);
        }
    }
}


// Create specific HTML elements
function createFilterBtn(value){
    return createBtn("btn-info filter-btn", value);
}

function createAddRuleBtn() {
    return createBtn("btn-outline-info", "Add Rule");
}

function createAttrDropdown(attributes) {
    return createDropdown("node-attr-dropdown", "filter-form", attributes);
}

function createAttrInput() {
    return createTextInput("node-attr-input", "filter-form", "Filter...");
}

function createRuleItem(id, prop, val){
    return createListItem(id, "", prop + ": " + val);
}

function createDeleteRuleBtn(){
    return $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
}

function createObjectPropItem(key, value) {
    let row = `<div class="row"><div class="col-4 offset-2">${key}</div><div class="col-6">${value}</div></div>`;
    return createListItem('""', '""', row);
}


// Create general HTML elements
function createBtn(className, value) {
    return $(`<input type="button" class="btn ${className}" value=${value}>`);
}

function createDropdown(id, className, values){
    let dropdown = $(`<select id=${id} class="custom-select ${className}"></select>`);
    values.forEach(value => {
        dropdown.append($(`<option value=${value}>${value}</option>`));
    });
    return dropdown;
}

function createTextInput(id, className, placeholder) {
    return $(`<input type="text" id=${id} class="form-control ${className}" placeholder=${placeholder}>`);
}

function createListItem(id, className, value) {
    return $(`<li id=${id} class="list-group-item ${className}">${value}</li>`);
}
