import properties from "../assets/generated/properties";
import {initFilterTabView, renderObjectProps} from "./view-utilities";

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

        initFilterTabView(nodeProps, edgeProps);
    }

    bindFilterByClassFunctionality(cb){
        $('.filter-btn').on('click', cb);
    }

    showObjectProps(event){
        $('#object-tab').click();

        let props = getCommonObjectProps(event.target);

        renderObjectProps(props);
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

// Handle Tab functionality
// Node & Edge classes

// Node properties for each class
// Edge properties for each class