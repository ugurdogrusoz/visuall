import CyManager from "./cy-manager";
import TabManager from "./tab-manager";
import ViewManager from "./view-manager";


export default class AppManager{

    constructor(){
        this.cyManager = new CyManager(this);
        this.viewManager = new ViewManager(this);
        this.tabManager = new TabManager(this);
    }

    // CyManager methods
    createFilterRule(prop, value){
        this.cyManager.createFilterRule(prop, value);
    }

    deleteFilterRule(ruleID){
        $("#" + ruleID).remove();
        this.cyManager.deleteFilterRule(ruleID);
    }

    // TabManager methods
    showObjectProps(event){
        this.tabManager.showObjectProps(event);
    }

    hideObjectProps(event){
        this.tabManager.hideObjectProps(event);
    }

    // ViewManager methods
    initFilterTabView(nodeProps, edgeProps){
        this.viewManager.initFilterTabView(nodeProps, edgeProps);

        const cyManager = this.cyManager;
        $('.filter-btn').on('click', cyManager.filterElesByClass.bind(cyManager));
    }

    renderObjectProps(objectProps){
        this.viewManager.renderObjectProps(objectProps);
    }
}