# Visu*all* User Guide

This guide shows how Visu*all* sample application can be used to analyze movie dataset available in this application. This sample app assumes a Neo4j databasase installed on a server side with free and openly available movie dataset. The client side on the other hand is a web page with main components of a menubar and a toolbar on top, a drawing canvas to show relations as a graph / map and a collection of panels on the right.

ToDo: Visuall screenshot showing various components of the GUI

Visu*all* uses [Cytoscape.js](https://js.cytoscape.org/) and many of [its extensions](https://js.cytoscape.org/#extensions) to provide a drawing canvas, where relations among various movies and people involved can be visualized and further inspected. Hence, many of the capabilities of Visu*all* is inherited from Cytoscape.js, including pan, zoom, drag, navigator window, context menus, automatic layout, etc.

## Menubar

Menubar contains many different, file, editing, view, highlight and layout operations. The File menu allows one to save the current map to disk and load it back when needed. It also allows you to save the current map as a static PNG image. In addition, the Edit menu allows the user to delete selected map objects from the map. The view menu contains operations to manage complexity of the map by *temporarily* hiding selected map objects and showing them back when needed. Notice that this is different from deletion, which deletes the map objects from the Cytoscape.js model, and hence the client. Below you will find: an original map with certain objects selected (left), after selected objects are hidden using "View > Hide Selected" (middle), and when all map content in the client is shown with "View > Show All".

ToDo: figure

The highlight menu aims to draw attention to certain map objects (e.g. a group of nodes and/or edges or paths in the underlying network). 

The user may use this menu to highlight map objects that contain a specified substring in their labels or other properties (numbers are converted to strings before such a search is applied). All highlights made so far could be removed from the map using "Remove Highlights" in this menu. Below is the result of searching "Neo" in a sample map.

ToDo: figure

The layout operations may be used to either "tidy up" the layout of the current map using "Layout > Perform Layout". This operation takes current locations of map objects into account and performs an *incremental layout* by optimizing their geometric distances to be in line with their graph theoretic distances. However, if you think that you're not happy with the current layout and would like a new one to be calculated *from sctratch*, they you should perform "Layout > Recalculate Layout". Notice that an incremental layout is applied on some interactive operations where the result of a query is *merged* into the current map instead of replacing it. When, however, the result of an operation is to *replace* the current map content, layout is recalculated from scratch. Below is the same movie network laid out randomly (left), and automatically by Visuall (right).

ToDo: figure

A quick help is available under the Help menu to quickly enumerate some gestures to manipulate the drawings in the canvas.

## Toolbar

A toolbar is available right under the menubar to lists some frequently needed operations grouped in the same manner as the menu.

## Object Inspection

Each node and edge has a set of properties (property-value pairs) as defined in the associated model description file of the Visu*all* application. If you click on a graph object (a node or an edge) to select it, any current selection will be lifted and the graph object that you clicked on will be selected. As a graph object is selected, its properties are shown on the right panel under the "Object" tab. Below is a map where an movie was selected and is being inspected in the Object tab in the right panel.

ToDo: figure

Other objects may be added to current selection using the Shift + click. On multiple object selection, Visu*all* determines any common properties of such objects, and displays only those common properties.

## Grouping

Visu*all* allows nesting of maps through groups or clusters. One way to group movies and persons involved is the [Markov clustering algorithm](https://js.cytoscape.org/#eles.markovClustering) available in Cytoscape.js. This algorithm pays attention only to the connectivity of the nodes ignoring any domain specific information. The alternative grouping mechanism available in Visu*all* is grouping by director. Here a director and the movies directed by this director are grouped together into a *compound* or *parent* node. However, if a movie is directed by multiple people, we leave the movie outside any such group. Below is an example where a sample movie network is not grouped (left) and grouped by director (right).

ToDo: figure

## Filtering



## Querying

## Settings

## Timeline

