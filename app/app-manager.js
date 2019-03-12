import CyManager from "./cy-manager";
import FileManager from "./file-manager";
import TabManager from "./tab-manager";
import DbManager from "./db-manager";


export default class AppManager{

    constructor(){
        this.cyManager = new CyManager(this);
        this.fileManager = new FileManager(this);
        this.tabManager = new TabManager(this);
        this.dbManager = new DbManager(this);

        this.cyManager.init();
        this.fileManager.init();
        this.tabManager.init();
        this.dbManager.init();
    }

    // CyManager methods
    createFilterRule(prop, value){
        this.cyManager.createFilterRule(prop, value);
    }

    deleteFilterRule(ruleID){
        this.cyManager.deleteFilterRule(ruleID);
    }

    filterElesByClass(event){
        this.cyManager.filterElesByClass(event);
    }

    loadFile(file){
        this.cyManager.loadFile(file);
    }

    loadElementsFromDatabase(data){
        this.cyManager.loadElementsFromDatabase(data);
    }

    // FileManager methods
    saveAsJson(file){
        this.fileManager.saveAsJson(file);
    }

    saveAsPng(file){
        this.fileManager.saveAsPng(file);
    }

    // TabManager methods
    showObjectProps(event){
        this.tabManager.showObjectProps(event);
    }

    hideObjectProps(event){
        this.tabManager.hideObjectProps(event);
    }


    // DbManager methods
    runQuery(query, cb){
        this.dbManager.runQuery(query, cb);
    }

    //General functions
    static getOperator(value, type){
        if(type === 'number'){
            if(value === "1")
                return '=';
            else if(value === "2")
                return '!=';
            else if(value === "3")
                return '<';
            else if(value === "4")
                return '>';
            else if(value === "5")
                return '<=';
            else if(value === "6")
                return '>=';
        }
        else if(type === 'string'){
            if(value === "1")
                return '=';
            else if(value === "2")
                return 'CONTAINS';
            else if(value === "3")
                return 'STARTS WITH';
            else if(value === "4")
                return 'ENDS WITH';
        }
    }
}