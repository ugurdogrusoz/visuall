import cytoscape from "cytoscape";
import stylesheet from "../assets/generated/stylesheet.json";


export default class CyManager {

    constructor(){
        this.initCyInstance(stylesheet);
        this.filteredClasses = [];
    }

    get cyInstance(){
        return this.cy;
    }

    initCyInstance(stylesheet){
        stylesheet.forEach(function (obj) {
            obj.style.label = new Function('ele', obj.style.label);
        });

        this.cy = cytoscape({
                container: document.getElementById('cy'),
                elements: [
                    {group: "nodes", data: {id: "p1", first_name: "Ahmet", last_name: "Demir"}, classes: "person"},
                    {group: "nodes", data: {id: "p2", first_name: "Ayşe", last_name: "Yılmaz"}, classes: "person"},

                    {group: "nodes", data: {id: "s1", number: 1111}, classes: "sim"},
                    {group: "nodes", data: {id: "s2", number: 1223}, classes: "sim"},
                    {group: "nodes", data: {id: "s3", number: 6666}, classes: "sim"},

                    {group: "nodes", data: {id: "d1", name: "Turkcell Bilkent Center"}, classes: "dealer"},

                    {group: "nodes", data: {id: "a1", street: "Tunus", apt_number: 12}, classes: "address"},
                    {group: "nodes", data: {id: "a2", street: "Üniversiteler", apt_number: 4}, classes: "address"},
                    {group: "nodes", data: {id: "a3", street: "Bahçeli", apt_number: 39}, classes: "address"},

                    {group: "edges", data: {id: "o1", source: "p1", target: "s1"}, classes: "owns"},
                    {group: "edges", data: {id: "o2", source: "p1", target: "s3"}, classes: "owns"},
                    {group: "edges", data: {id: "o3", source: "p2", target: "s2"}, classes: "owns"},
                    {group: "edges", data: {id: "l1", source: "p1", target: "a1"}, classes: "lives-in"},
                    {group: "edges", data: {id: "l2", source: "p2", target: "a2"}, classes: "lives-in"},
                    {group: "edges", data: {id: "sold1", source: "s1", target: "d1"}, classes: "is-sold-by"},
                    {group: "edges", data: {id: "sold2", source: "s2", target: "d1"}, classes: "is-sold-by"},
                    {group: "edges", data: {id: "sold3", source: "s3", target: "d1"}, classes: "is-sold-by"},
                    {group: "edges", data: {id: "i1", source: "d1", target: "a3"}, classes: "is-in"},
                ],
                style: stylesheet,
                layout: {name: 'cose'},

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
}

// Store node/edge properties

// Store node/edge styles

// Handle Cytoscape functions