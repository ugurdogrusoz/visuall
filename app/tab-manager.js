import properties from "../assets/generated/properties";
import AppManager from "./app-manager";


export default class TabManager {

    constructor(appManager){
        this.appManager = appManager;
    }

    init(){
        this.initProperties(properties);
        this.initFilterTab();
        this.bindHTMLEvents();
    }

    initProperties(properties){
        this.nodeProperties = properties.nodes;
        this.edgeProperties = properties.edges;
    }

    initFilterTab(){
        const nodeProps = this.nodeProperties;
        const edgeProps = this.edgeProperties;

        let classFilterDiv = $('#filter-class');

        let nodeAttrList = [];

        // Generate filter elements for node properties
        for(const prop in nodeProps){
            const filterBtn = $(`<input type="button" class="btn btn-info filter-btn" value="${prop}">`);
            filterBtn.on('click', event => this.appManager.filterElesByClass(event));
            classFilterDiv.append(filterBtn);

            for(const attr in nodeProps[prop]){
                if(!nodeAttrList.includes(attr))
                    nodeAttrList.push(attr);
            }
        }
        classFilterDiv.append($('<br>'));

        for(const prop in edgeProps){
            const filterBtn = $(`<input type="button" class="btn btn-warning filter-btn" value="${prop}">`);
            filterBtn.on('click', event => this.appManager.filterElesByClass(event));
            classFilterDiv.append(filterBtn);
        }

        appendDropdownOptions("node-attr-dropdown", nodeAttrList);
    }

    bindHTMLEvents() {
        const nodeAttrDropdown = $('#node-attr-dropdown');
        nodeAttrDropdown.on('change', () => this.onAttrDropdownChange());
        nodeAttrDropdown.change();

        $("#filter-add-rule-btn").on('click', () => this.onAddRuleClick());
    }

    onAttrDropdownChange(){
        const nodeProps = this.nodeProperties;
        const selected = $('#node-attr-dropdown option:selected').val();
        let attrType = "";
        for(const nodeClass in nodeProps){
            for(const property in nodeProps[nodeClass]){
                if(property === selected){
                    attrType = nodeProps[nodeClass][property];
                    break;
                }
            }
        }

        const numberRadioBtns = $('#filter-radio-btn-number');
        const textRadioBtns = $('#filter-radio-btn-string');
        numberRadioBtns.hide();
        textRadioBtns.hide();

        this.attributeType = attrType;
        if(attrType === "number"){
            numberRadioBtns.show();
        }
        else if(attrType === "string"){
            textRadioBtns.show();
        }
    }

    onAddRuleClick(){
        const logicOperator = $('#rule-operator-dropdown option:selected').val();
        const attribute = $('#node-attr-dropdown option:selected').val();
        const value = $('#node-attr-input').val();

        let operator;
        if(this.attributeType === "string"){
            operator = $('input[name="radio-btn-string"]:checked').val();
        }
        else if(this.attributeType === "number"){
            operator = $('input[name="radio-btn-number"]:checked').val();
        }

        if(!logicOperator || !attribute || !value || !operator)
            return;

        const rule = {
            attribute: attribute,
            attributeType: this.attributeType,
            value: value,
            logicOperator: logicOperator,
            operator: operator
        };

        this.appManager.createFilterRule(rule);

        const ruleDeleteBtn = renderFilterRule(rule);
        ruleDeleteBtn.on('click', () => {
            $("#" + rule.id).remove();
            this.appManager.deleteFilterRule(rule.id)
        });
    }

    showObjectProps(event){
        $('#object-tab').click();

        let props = getCommonObjectProps(event.target);

        this.renderObjectProps(props);
    }

    hideObjectProps(event){}

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

function appendDropdownOptions(id, values){
    let dropdown = $('#'+id);

    values.forEach(value => {
        dropdown.append($(`<option value="${value}">${value}</option>`));
    });
}

function createObjectPropItem(key, value) {
    let row = `<div class="row"><div class="col-4">${key}</div><div class="col-8">${value}</div></div>`;
    return $(`<li class="list-group-item">${row}</li>`);
}

function renderFilterRule(rule){
    const logicOperator = rule.logicOperator;
    const operator = AppManager.getOperator(rule.operator, rule.attributeType);
    const ruleId = rule.id;
    const attribute = rule.attribute;
    const value = rule.value;

    const ruleText = `[${logicOperator}] <b>${attribute}</b> ${operator} <b>${value}</b>`;
    const listItem = $(`<li id="${ruleId}" class="list-group-item ${attribute}">${ruleText}</li>`);
    const deleteBtn = $('<button type="button" class="close" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span></button>');

    listItem.append(deleteBtn);
    $('#filter-node-rules').append(listItem);

    return deleteBtn;
}