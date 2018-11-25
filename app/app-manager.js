import CyManager from "./cy-manager";
import TabManager from "./tab-manager";


// Create managers
let cyManager = new CyManager();
let tabManager = new TabManager();

tabManager.bindClassFilterFunctionality(cyManager.filterElesByClass.bind(cyManager));