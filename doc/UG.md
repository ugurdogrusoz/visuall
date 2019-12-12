# Visu*all* User Guide

This guide shows how Visu*all* sample application can be used to analyze movie dataset available in this application. This sample app assumes a Neo4j databasase installed on a server side with free and openly available movie dataset. The client side on the other hand is a web page with main components of a menubar and a toolbar on top, a drawing canvas to show relations as a graph / map and a collection of panels on the right.

<p align="center">
  <img src="image/visuall-ss.png" title="Visuall and its various components"/>
</p>

Visu*all* uses [Cytoscape.js](https://js.cytoscape.org/) and many of [its extensions](https://js.cytoscape.org/#extensions) to provide a drawing canvas, where relations among various movies and people involved can be visualized and further inspected. Hence, many of the capabilities of Visu*all* is inherited from Cytoscape.js, including pan, zoom, drag, navigator window, context menus, automatic layout, etc.

## Menubar

Menubar contains many different, file, editing, view, highlight and layout operations. The File menu allows one to save the current map to disk and load it back when needed. It also allows you to save the current map as a static PNG image. In addition, the Edit menu allows the user to delete selected map objects from the map. The view menu contains operations to manage complexity of the map by *temporarily* hiding selected map objects and showing them back when needed. Notice that this is different from deletion, which deletes the map objects from the Cytoscape.js model, and hence the client. Below you will find: an original map with certain objects selected (left), after selected objects are hidden using `View > Hide Selected` (middle), and when all map content in the client is shown with `View > Show All`.

<p align="center">
  <img src="image/hide-show-1.png" height="160"/>&emsp;&emsp;
  <img src="image/hide-show-2.png" height="160"/>&emsp;&emsp;
  <img src="image/hide-show-3.png" height="160"/>
</p>

The highlight menu aims to draw attention to certain map objects (e.g. a group of nodes and/or edges or paths in the underlying network). 

The user may use this menu to highlight map objects that contain a specified substring in their labels or other properties (numbers are converted to strings before such a search is applied). All highlights made so far could be removed from the map using "Remove Highlights" in this menu. Below is the result of searching "Neo" in a sample map.

<p align="center">
  <img src="image/search-example.png" width="360" title="Result of search for Neo in a sample map highlighted in yellow"/>
</p>

The layout operations may be used to either "tidy up" the layout of the current map using "Layout > Perform Layout". This operation takes current locations of map objects into account and performs an *incremental layout* by optimizing their geometric distances to be in line with their graph theoretic distances. However, if you think that you're not happy with the current layout and would like a new one to be calculated *from sctratch*, they you should perform "Layout > Recalculate Layout". Notice that an incremental layout is applied on some interactive operations where the result of a query is *merged* into the current map instead of replacing it. When, however, the result of an operation is to *replace* the current map content, layout is recalculated from scratch. Below is the same movie network laid out randomly (left), and automatically by Visuall (right).

<p align="center">
  <img src="image/layout-before.png" height="200"/>&emsp;&emsp;
  <img src="image/layout-after.png" height="200"/>
</p>

A quick help is available under the Help menu to quickly enumerate some gestures to manipulate the drawings in the canvas.

## Toolbar

A toolbar is available right under the menubar to lists some frequently needed operations grouped in the same manner as the menu.

## Object Inspection

Each node and edge has a set of properties (property-value pairs) as defined in the associated model description file of the Visu*all* application. If you click on a graph object (a node or an edge) to select it, any current selection will be lifted and the graph object that you clicked on will be selected. As a graph object is selected, its properties are shown on the right panel under the "Object" tab. Below is a map where a movie was selected and is being inspected in the Object tab in the right panel.

<p align="center">
  <img src="image/object-inspector-example.png" width="360" title="When a map object is selected, its properties are shown in the Object tab in the right panel"/>
</p>

Other objects may be added to current selection using the Shift + click. On multiple object selection, Visu*all* determines any common properties of such objects, and displays only those common properties.

## Grouping

Visu*all* allows nesting of maps through groups or clusters. One way to group movies and persons involved is the [Markov clustering algorithm](https://js.cytoscape.org/#eles.markovClustering) available in Cytoscape.js. This algorithm pays attention only to the connectivity of the nodes ignoring any domain specific information. The alternative grouping mechanism available in Visu*all* is grouping by director. Here a director and the movies directed by this director are grouped together into a *compound* or *parent* node. However, if a movie is directed by multiple people, we leave the movie outside any such group (e.g. the movie "The Matrix" in the example below). Below is an example where a sample movie network is not grouped (left) and grouped by director (right).

<p align="center">
  <img src="image/group-by-director-example.png" width="360" title="The movies and people involved were grouped by director"/>
</p>

## Filtering

### Filtering by type

One important way to reduce complexity of a drawing is to filter out certain types of objects or relationships from your map. Visu*all* facilitates this by providing a button per graph object. Below is an example where a map is shown with all node and edge types (left) and the same map after "ACTED_IN" edge was filtered out (right).

<p align="center">
  <img src="image/filter-by-type-before.png" height="180"/>&emsp;&emsp;
  <img src="image/filter-by-type-after.png" height="180"/>
</p>

### Filtering by rule

Often times, the user will like to filter the content available in the database or in the client side by some rules. Visu*all* facilitates this by letting the user to put together some rules via relational and logical operators.

First the user chooses an object type followed by a property of that object type, a relational operator and a value. For instance, if we are interested in movies whose rating is greater than 8, we should choose the object type `Movie`, choose the property `rating`, select `>` and input `8` as the value. Then, upon clicking the `+` sign, the rules is added as shown below.

<p align="center">
  <img src="image/filter-by-rule-example-1.png" width="220"/>
</p>

In case the chosen object type is a node, the user may also choose an incident edge type on that particular node type. For instance, when the object type is `Person`, along with the properties of `Person` objects such as name, compatible edge types such as `ACTED_IN` will be listed to construct a rule. When an edge type is chosen for a selected node type, the rules will be based on edge count (degree of that node type for that particular edge type). As an example, if we're interested in all persons who acted in more than 5 movies, then we first choose the edge type as `Person`. Then, since the rule is to depend on degree of `Person` nodes on `ACTED_IN` edges, we selected `ACTED_IN` from the dropdown menu. Finally we select `>` as the logical operator, `5` as the value, and hit the `+` sign to add the rule as shown below with an example.

<p align="center">
  <img src="image/filter-by-rule-example-2.png" width="220"/>
</p>

One can combine rules that belong to the same object type through logical operators as well. For instance, if we are interested in movies with rating at least 8 *and* released during or after 2000, we can put together a rule composed of both components as follows. Notice here that the logical operation between multiple rule components is `OR` by default but could be changed to `AND` by clicking on it and vice versa.

<p align="center">
  <img src="image/filter-by-rule-example-3.png" width="220"/>
</p>


Before we actually run and obtain the result of the rule, we have some options we might consider changing:

- Database: When this is enabled, the rule is applied to the objects in the database as opposed to the objects currently in the browser, the client side as model by a Cytoscape.js graph.

- Graph: When this is checked, the query result is shown in the graph drawing canvas. In case we think the result might be too big to display at once in the canvas, however, we could check this off and get the results as a table. The results in the table then can be gradually displayed in the canvas by clicking on the corresponding "Graph" icon.

- Merge: When this option is enabled, the graph currently in the canvas stays and results are *merged* into it, without avoiding any duplication. In other words, if the movie "The Matrix" was already in the graph and the query result contain this movie, we do not redundantly displayed the query result as a separate node to better enable the user to *connect the dots* in a sense.

## Querying

## Settings

## Timeline

