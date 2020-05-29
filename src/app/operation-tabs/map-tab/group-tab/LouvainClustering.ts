// Thanks to the original author https://github.com/upphiminn/jLouvain
export class LouvainClustering {

  // Constants
  private __PASS_MAX = -1;
  private __MIN = 0.0000001;

  private original_graph = {};
  private edge_index = {};

  setOriginalGraph(g) {
    this.original_graph = g;
  }

  //Helpers
  makeSet(array: (number | string)[]): string[] {
    const set = {};

    array.forEach(function (d) {
      set[d] = true;
    });

    return Object.keys(set);
  }

  get_degree_for_node(graph, node) {
    const neighbours = graph._assoc_mat[node] ? Object.keys(graph._assoc_mat[node]) : [];
    let weight = 0;

    neighbours.forEach(function (neighbour) {
      let value = graph._assoc_mat[node][neighbour] || 1;
      if (node === neighbour) {
        value *= 2;
      }
      weight += value;
    });

    return weight;
  }

  get_neighbours_of_node(graph, node) {
    if (typeof graph._assoc_mat[node] === 'undefined') {
      return [];
    }

    let neighbours = Object.keys(graph._assoc_mat[node]);

    return neighbours;
  }

  get_edge_weight(graph, node1, node2) {
    return graph._assoc_mat[node1] ? graph._assoc_mat[node1][node2] : undefined;
  }

  get_graph_size(graph) {
    let size = 0;

    graph.edges.forEach(function (edge) {
      size += edge.weight;
    });

    return size;
  }

  add_edge_to_graph(graph, edge) {
    this.update_assoc_mat(graph, edge);

    if (this.edge_index[edge.source + '_' + edge.target]) {
      graph.edges[this.edge_index[edge.source + '_' + edge.target]].weight = edge.weight;
    } else {
      graph.edges.push(edge);
      this.edge_index[edge.source + '_' + edge.target] = graph.edges.length - 1;
    }
  }

  make_assoc_mat(edge_list) {
    const mat = {};

    edge_list.forEach(function (edge, i) {
      mat[edge.source] = mat[edge.source] || {};
      mat[edge.source][edge.target] = edge.weight;
      mat[edge.target] = mat[edge.target] || {};
      mat[edge.target][edge.source] = edge.weight;
    });

    return mat;
  }

  update_assoc_mat(graph, edge) {
    graph._assoc_mat[edge.source] = graph._assoc_mat[edge.source] || {};
    graph._assoc_mat[edge.source][edge.target] = edge.weight;
    graph._assoc_mat[edge.target] = graph._assoc_mat[edge.target] || {};
    graph._assoc_mat[edge.target][edge.source] = edge.weight;
  }

  clone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    let temp = obj.constructor();

    for (let key in obj) {
      temp[key] = this.clone(obj[key]);
    }

    return temp;
  }

  //Core-Algorithm Related
  init_status(graph, status, part) {
    status['nodes_to_com'] = {};
    status['total_weight'] = 0;
    status['internals'] = {};
    status['degrees'] = {};
    status['gdegrees'] = {};
    status['loops'] = {};
    status['total_weight'] = this.get_graph_size(graph);

    if (typeof part === 'undefined') {
      graph.nodes.forEach((node, i) => {
        status.nodes_to_com[node] = i;

        let deg = this.get_degree_for_node(graph, node);

        if (deg < 0) {
          throw new TypeError('Graph should only have positive weights.');
        }

        status.degrees[i] = deg;
        status.gdegrees[node] = deg;
        status.loops[node] = this.get_edge_weight(graph, node, node) || 0;
        status.internals[i] = status.loops[node];
      });
    } else {
      graph.nodes.forEach((node, i) => {
        const com = part[node];
        status.nodes_to_com[node] = com;
        const deg = this.get_degree_for_node(graph, node);
        status.degrees[com] = (status.degrees[com] || 0) + deg;
        status.gdegrees[node] = deg;
        let inc = 0.0;
        let neighbours = this.get_neighbours_of_node(graph, node);

        neighbours.forEach(function (neighbour) {
          const weight = graph._assoc_mat[node][neighbour];

          if (weight <= 0) {
            throw new TypeError('Graph should only have positive weights.');
          }

          if (part[neighbour] === com) {
            if (neighbour === node) {
              inc += weight;
            } else {
              inc += weight / 2.0;
            }
          }
        });

        status.internals[com] = (status.internals[com] || 0) + inc;
      });
    }
  }

  __modularity(status) {
    const links = status.total_weight;
    let result = 0.0;
    const communities = this.makeSet(Object.values(status.nodes_to_com));

    communities.forEach(function (com) {
      const in_degree = status.internals[com] || 0;
      const degree = status.degrees[com] || 0;
      if (links > 0) {
        result = result + in_degree / links - Math.pow(degree / (2.0 * links), 2);
      }
    });

    return result;
  }

  __neighcom(node, graph, status) {
    // compute the communities in the neighb. of the node, with the graph given by
    // node_to_com
    const weights = {};
    const neighboorhood = this.get_neighbours_of_node(graph, node); //make iterable;

    neighboorhood.forEach(function (neighbour) {
      if (neighbour !== node) {
        const weight = graph._assoc_mat[node][neighbour] || 1;
        const neighbourcom = status.nodes_to_com[neighbour];
        weights[neighbourcom] = (weights[neighbourcom] || 0) + weight;
      }
    });

    return weights;
  }

  __insert(node, com, weight, status) {
    // insert node into com and modify status
    status.nodes_to_com[node] = +com;
    status.degrees[com] = (status.degrees[com] || 0) + (status.gdegrees[node] || 0);
    status.internals[com] = (status.internals[com] || 0) + weight + (status.loops[node] || 0);
  }

  __remove(node, com, weight, status) {
    //remove node from com and modify status
    status.degrees[com] = (status.degrees[com] || 0) - (status.gdegrees[node] || 0);
    status.internals[com] = (status.internals[com] || 0) - weight - (status.loops[node] || 0);
    status.nodes_to_com[node] = -1;
  }

  __renumber(dict) {
    let count = 0;
    const ret = this.clone(dict); //deep copy :)
    const new_values = {};
    const dict_keys = Object.keys(dict);

    dict_keys.forEach(function (key) {
      const value = dict[key];
      let new_value = typeof new_values[value] === 'undefined' ? -1 : new_values[value];

      if (new_value === -1) {
        new_values[value] = count;
        new_value = count;
        count = count + 1;
      }

      ret[key] = new_value;
    });

    return ret;
  }

  __one_level(graph, status) {
    //Compute one level of the Communities Dendogram.
    let modif = true;
    let nb_pass_done = 0;
    let cur_mod = this.__modularity(status);
    let new_mod = cur_mod;

    while (modif && nb_pass_done !== this.__PASS_MAX) {
      cur_mod = new_mod;
      modif = false;
      nb_pass_done += 1;

      graph.nodes.forEach((node, i) => {
        let com_node = status.nodes_to_com[node];
        let degc_totw = (status.gdegrees[node] || 0) / (status.total_weight * 2.0);
        let neigh_communities = this.__neighcom(node, graph, status);
        this.__remove(node, com_node, neigh_communities[com_node] || 0.0, status);
        let best_com = com_node;
        let best_increase = 0;
        const neigh_communities_entries = Object.keys(neigh_communities); // make iterable;

        neigh_communities_entries.forEach(function (com) {
          const incr = neigh_communities[com] - (status.degrees[com] || 0.0) * degc_totw;

          if (incr > best_increase) {
            best_increase = incr;
            best_com = com;
          }
        });

        this.__insert(node, best_com, neigh_communities[best_com] || 0, status);

        if (best_com !== com_node) {
          modif = true;
        }
      });

      new_mod = this.__modularity(status);

      if (new_mod - cur_mod < this.__MIN) {
        break;
      }
    }
  }

  induced_graph(partition, graph) {
    const ret = { nodes: [], edges: [], _assoc_mat: {} };
    let w_prec, weight;
    //add nodes from partition values
    const partition_values = Object.values(partition) as string[];
    ret.nodes = ret.nodes.concat(this.makeSet(partition_values)); //make set

    graph.edges.forEach((edge, i) => {
      weight = edge.weight || 1;
      const com1 = partition[edge.source];
      const com2 = partition[edge.target];
      w_prec = this.get_edge_weight(ret, com1, com2) || 0;
      const new_weight = w_prec + weight;
      this.add_edge_to_graph(ret, { source: com1, target: com2, weight: new_weight });
    });

    this.edge_index = {};

    return ret;
  }

  partition_at_level(dendogram, level) {
    let partition = this.clone(dendogram[0]);

    for (let i = 1; i < level + 1; i++) {
      Object.keys(partition).forEach(function (key, j) {
        let node = key;
        let com = partition[key];
        partition[node] = dendogram[i][com];
      });
    }

    return partition;
  }

  generate_dendogram(graph, part_init) {
    if (graph.edges.length === 0) {
      const part = {};
      graph.nodes.forEach(function (node) {
        part[node] = node;
      });

      return part;
    }

    const status = {} as any;

    this.init_status(this.original_graph, status, part_init);
    let mod = this.__modularity(status);
    const status_list = [];
    this.__one_level(this.original_graph, status);
    let new_mod = this.__modularity(status);
    let partition = this.__renumber(status.nodes_to_com);
    status_list.push(partition);
    mod = new_mod;
    let current_graph = this.induced_graph(partition, this.original_graph);
    this.init_status(current_graph, status, undefined);

    while (true) {
      this.__one_level(current_graph, status);
      new_mod = this.__modularity(status);
      if (new_mod - mod < this.__MIN) {
        break;
      }

      partition = this.__renumber(status.nodes_to_com);
      status_list.push(partition);

      mod = new_mod;
      current_graph = this.induced_graph(partition, current_graph);
      this.init_status(current_graph, status, undefined);
    }

    return status_list;
  }

  cluster() {
    // const dendogram = this.generate_dendogram(this.original_graph, undefined) as any[];
    // return this.partition_at_level(dendogram, dendogram.length - 1);
  }

}