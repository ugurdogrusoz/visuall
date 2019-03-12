import {db_config} from "./config";


export default class DbManager {

    constructor(appManager){
        this.appManager = appManager;
    }

    init(){

    }

    runQuery(query, cb){
        const url = db_config.request_url;
        const username = db_config.username;
        const password = db_config.password;
        const requestBody = {
            "statements" : [ {
                "statement" : query,
                "resultDataContents" : [ "graph" ]
            } ]
        };

        $.ajax({
            type: "POST",
            url: url,
            headers: {
                Accept: "application/json; charset=UTF-8",
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
            data: JSON.stringify(requestBody),
            success: (response) => {
                const data = extractDataFromQueryResponse(response);
                cb(data);
            }
        });
    }
}

function extractDataFromQueryResponse(response){
    let nodes = {};
    let edges = {};

    const results = response.results[0];
    if(!results){
        console.error("Invalid query!", response.errors[0]);
        return;
    }

    const data = response.results[0].data;
    for(let i = 0; i < data.length; i++){
        const graph = data[i].graph;
        const graph_nodes = graph.nodes;
        const graph_edges = graph.relationships;

        for(let node of graph_nodes){
            const node_id = node.id;
            nodes[node_id] = node;
        }

        for(let edge of graph_edges){
            const edge_id = edge.id;
            edges[edge_id] = edge;
        }
    }

    return {
        "nodes": nodes,
        "edges": edges
    };
}