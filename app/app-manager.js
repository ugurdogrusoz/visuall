import CyManager from "./cy-manager";
import TabManager from "./tab-manager";


export default class AppManager{

    constructor(){
        this.cyManager = new CyManager();
        this.tabManager = new TabManager();

        this.bindFunctionsToManagers();
    }

    bindFunctionsToManagers(){
        let tabManager = this.tabManager;
        let cyManager = this.cyManager;

        tabManager.bindFilterByClassFunctionality(cyManager.filterElesByClass.bind(cyManager));

        cyManager.bindObjectOnSelectFunctionality(tabManager.showObjectProps.bind(tabManager));
        cyManager.bindObjectOnUnselectFunctionality(tabManager.hideObjectProps.bind(tabManager));
    }
}