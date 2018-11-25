import CyManager from "./cy-manager";
import TabManager from "./tab-manager";


// Create managers
let cyManager = new CyManager();
let tabManager = new TabManager();

tabManager.bindFilterByClassFunctionality(cyManager.filterElesByClass.bind(cyManager));

cyManager.bindObjectOnSelectFunctionality(tabManager.showObjectProps.bind(tabManager));
cyManager.bindObjectOnUnselectFunctionality(tabManager.hideObjectProps.bind(tabManager));