import cytoscape from "cytoscape";
import stylesheet from "../assets/generated/stylesheet.json";
import AppManager from "./app-manager";


export default class CyManager {

    constructor(appManager){
        this.appManager = appManager;
    }

    init(){
        this.filteredClasses = [];
        this.layout = {
            name: 'cose',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        };
        this.filteringRules = [];
        this.ruleCounter = 0;

        $('#rules-title').hide();

        this.initCyInstance(stylesheet);
        this.bindCyEvents();
        this.bindHTMLEvents();
    }

    initCyInstance(stylesheet){
        stylesheet.forEach(function (obj) {
            obj.style.label = new Function('ele', obj.style.label);
        });

        this.cy = cytoscape({
                container: document.getElementById('cy'),
                style: stylesheet,
                layout: this.layout,

                // initial viewport state:
                zoom: 1,
                pan: { x: 0, y: 0 },

                // interaction options:
                minZoom: 1e-50,
                maxZoom: 1e50,
                zoomingEnabled: true,
                userZoomingEnabled: true,
                panningEnabled: true,
                userPanningEnabled: true,
                boxSelectionEnabled: false,
                selectionType: 'single',
                touchTapThreshold: 8,
                desktopTapThreshold: 4,
                autolock: false,
                autoungrabify: false,
                autounselectify: false,

                // rendering options:
                headless: false,
                styleEnabled: true,
                hideEdgesOnViewport: false,
                hideLabelsOnViewport: false,
                textureOnViewport: false,
                motionBlur: false,
                motionBlurOpacity: 0.2,
                wheelSensitivity: 0.5,
                pixelRatio: 'auto'
            });
    }

    bindCyEvents(){
        this.cy.on('select', event => this.appManager.showObjectProps(event));
        this.cy.on('unselect', event => this.appManager.hideObjectProps(event));
    }

    bindHTMLEvents(){
        $('#save-json-btn').on('click', () => this.saveAsJson());
        $('#save-png-btn').on('click', () => this.saveAsPng());
    }

    filterElesByClass(event){
        const btn = $(event.target);

        const willBeShowed = btn.hasClass('strike-through');

        btn.blur();
        btn.toggleClass('btn-info btn-outline-secondary strike-through');

        if(willBeShowed)
            this.showElementsByClass(btn.val());
        else
            this.hideElementsByClass(btn.val());
    }

    hideElementsByClass(className){
        this.filteredClasses.push(className);

        let eles = this.cy.elements('.' + className);
        eles.addClass('hidden');
    }

    showElementsByClass(className){
        const index = this.filteredClasses.indexOf(className);
        if(index < 0)
            return;
        this.filteredClasses.splice(index, 1);

        let eles = this.cy.elements('.' + className);
        eles.forEach(ele => {
            let show = true;
            for(let filteredClass in this.filteredClasses){
                if(ele.hasClass(filteredClass)){
                    show = false;
                    break;
                }
            }

            if(show)
                ele.removeClass('hidden');
        });
    }

    createFilterRule(rule){
        this.ruleCounter++;
        rule.id = this.ruleCounter;

        $('#rules-title').show();

        this.filteringRules.push(rule);
        this.runFilteringQuery();
    }

    deleteFilterRule(ruleId) {
        for(let i = 0; i < this.filteringRules.length; i++){
            const rule = this.filteringRules[i];
            if(rule.id === ruleId){
                this.filteringRules.splice(i, 1);
                this.runFilteringQuery();
                break;
            }
        }

        if(this.filteringRules.length < 1){
            $('#rules-title').hide();
        }
    }

    runFilteringQuery(){
        const rules = this.filteringRules;
        if(!rules || rules.length < 1)
            return;

        const firstRule = rules[0];
        const variableName1 = 'm';
        const variableName2 = 'n';

        let query = `MATCH p=(${variableName1})-[*0..1]-(${variableName2}) WHERE (`+ generateQuery(firstRule, variableName1);
        for(let i = 1; i < rules.length; i++){
            const rule = rules[i];
            query += rule.logicOperator + generateQuery(rule, variableName1);
        }
        query += ") AND (" + generateQuery(firstRule, variableName2);
        for(let i = 1; i < rules.length; i++){
            const rule = rules[i];
            query += rule.logicOperator + generateQuery(rule, variableName2);
        }
        query += `) RETURN DISTINCT relationships(p) as rs, ${variableName1}`;

        this.requestElementsFromDatabase(query);

        function generateQuery(rule, variableName) {
            let operator = AppManager.getOperator(rule.operator, rule.attributeType);
            let value = (rule.attributeType === "string") ? '"' + rule.value + '"' : rule.value;
            return ` (${variableName}.${rule.attribute + ' ' + operator + ' ' + value}) `;
        }
    }

    requestElementsFromDatabase(query){
        this.appManager.runQuery(query, (response) => this.loadElementsFromDatabase(response));
    }

    loadElementsFromDatabase(data){
        if(!data || !data.nodes || !data.edges){
            console.error("Empty response from database!");
            return;
        }

        const nodes = data.nodes;
        const edges = data.edges;
        let cy_nodes = [];
        let cy_edges = [];

        for(const id in nodes){
            const node = nodes[id];
            const classes = node.labels.join(" ").toLowerCase();
            let properties = node.properties;
            properties.id = id;

            const cy_node = {
                data: properties,
                classes: classes
            };
            cy_nodes.push(cy_node);
        }

        for(const id in edges){
            const edge = edges[id];
            const cy_edge = {
                data: {
                    id: id,
                    source: edge.startNode,
                    target: edge.endNode,
                },
                classes: edge.type
            };

            cy_edges.push(cy_edge);
        }


        this.cy.elements().remove();

        this.cy.add(cy_nodes);
        this.cy.add(cy_edges);

        this.cy.layout(this.layout).run();
    }

    loadFile(file){

        // Try to parse file into JSON object
        try{
            const fileJSON = JSON.parse(file);
            this.cy.json({elements: fileJSON});

            this.cy.layout(this.layout).run();
        }
        catch (error) {
            console.error('Given file is not suitable.', error);
        }

    }

    saveAsJson(){
        const json = this.cy.json();
        const elements = json.elements;

        this.appManager.saveAsJson(JSON.stringify(elements, undefined, 4));
    }

    saveAsPng(){
        const options = {
            bg: "white",
            scale: 1
        };
        const png = this.cy.png(options);

        this.appManager.saveAsPng(png);
    }
}