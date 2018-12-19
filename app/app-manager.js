import CyManager from "./cy-manager";
import TabManager from "./tab-manager";
import ViewManager from "./view-manager";


export default class AppManager{

    constructor(){
        this.cyManager = new CyManager(this);
        this.tabManager = new TabManager(this);
        this.viewManager = new ViewManager(this);

        this.cyManager.init();
        this.tabManager.init();
        this.viewManager.init();
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

        $('.filter-btn').on('click', event => this.cyManager.filterElesByClass(event));
    }

    renderObjectProps(objectProps){
        this.viewManager.renderObjectProps(objectProps);
    }
}