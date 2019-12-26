# Visu*all* Developer Guide

This guide details how a custom application can be built using Visu*all*. We assume the reader has already gone over [User Guide](UG.md), and in each of the following sections, we describe how to customize various parts of a Visu*all* based visual analysis tool.

## Data Model
The developer is required to first specify the structure of the data to be visualized in a [model description file](../src/assets/model_description.json). Once this file is prepared, the [style generator file](../src/style-generator.js) modifies [index.html file](../src/index.html), [styles.css file](../src/styles.css), [properties.json file](../src/assets/generated/properties.json) and [stylesheet.json file](../src/assets/generated/stylesheet.json), resulting in the desired customization, using the command:

`node style-generator.js /assest/model_description.json`

The model description file contains many sections as detailed below. 

### Application Information

The first section of the model description file named "appInfo" contains miscellaneous information about the visual application being developed as follows:

- **name**: Name of the application as it appears to the left of the menubar,
- **html_header**: Name of the application as it appears in the html page where Visu*all* is embedded,
- **icon**: Logo of the application as it appears to the left of the menubar,
- **version**: Version of the application as it appears in the About box,
- **company_name**: Name of the company / institution as it appears in the About box,
- **company_contact**: Contact info / email as it appears in the About box.

Below is how this section appears for the sample application:
```
  "appInfo": {
    "name": "Visu<i>all</i> Sample App",
    "html_header": "Visuall Sample App",
    "icon": "assets/img/logo.png",
    "version": "1.0.0 beta",
    "company_name": "i-Vis at Bilkent",
    "company_contact": "ivis@cs.bilkent.edu.tr"
  }
```
### Objects

The section named "objects" contains the stucture of different kinds of objects in your graphs. In other words, each *object* corresponds to a *node* type in your graph. For instance, in the sample movie application, there are two classes of nodes: `Person` and `Movie`. 

Each node has a set of associated *properties* and *style*. Each property has a name and data type. For example, `Person` class has the following properties: `name`, `born`, `start_t`, and `end_t`.  

Each *property* is one of the following data types: `string`, `int`, `float`, `datetime` and `enum`. Here, `string`, `float`, `int` are standard data types as described by most programming languages. `datetime`, on the other hand, is an integer which represents the date (and time in that date) in [Unix time stamp in milliseconds](https://currentmillis.com/). Finally, `enum` is a special type to define a group of pre-defined values for this property. Each `enum` type should be defined as a tuple `enum,<type>`, where the second element of the tuple corresponds to the type of the values in that enumeration. For instance, `enum,string` means this property's values are *string*. The corresponding set of values must be defined in the section named `finiteSetPropertyMapping` inside the model description file. 

You may also customize the style of your nodes via a *style* field to change their apperance in the drawing canvas. These styles should be defined the same way they are defined in [Cytoscape.js](https://js.cytoscape.org/#style). Notice that Cytoscape.js style follows CSS conventions as closely as possible. More on styling your graph objects will be provided in upcoming sections.

### Relations

This section contains the strcuture of different kinds of relations among the objects in your graph. Each *relation* corresponds to an *edge* type in your graph with specifc types of `source` and `target` nodes. `isBidirectional` is used to specify if the edge is bi-directional (undirected) or uni-directional (directed). For instance, in the sample movie application, we define an edge type named `ACTED_IN` from `Person` objects to `Movie` objects as `source` and `target`, respectively, with `isBirectional` set to `false`.

### Timebar

"timebarDataMapping" section of the model description file is used to map lifetime of nodes and edges. Lifetime information is used in [timebar service](../src/app/timebar.service.ts) to filter graph objects by time and show useful, user-defined statistics during the specified period. Ideally, each *class* and each *relation* would have two datetime properties corresponding to their *begin* and *end* datettimes. These two fields should be provided under *begin_datetime* and *end_datetime*, respectively. In case begin or end datetime of a graph object is not mapped to a property of that object, Visu*all* assumes the default begin (as early as minus infinity) and end datetimes (as late as plus infinity) for the timebar.

Minimum and maximum values for begin and datetimes are specified in the section on application default settings.

### Enumeration Mapping

"enumMapping" section of the file is used to map enum values to actual values to be shown. For example, the status of a computer device in a computer network might be internally represented with integers 1 and 2, corresponding to "up" and "down". Here, the type of the property `status` should be defined as `enum,int`, and the corresponding values are provided in an enumeration mapping in this section as:
```
  "enumMapping": {
    "Device": {
      "status": {
        1: "up",
        2: "down"
      }
    ...
```

### Default Styling

"generalStyles" section of the file establishes default styling as described [here](https://js.cytoscape.org/#style). While changing existing values should not break the styling of your Visu*all* component, adding or deleting new styling might result in undesired style problems; thus, use this with caution.

### Default Preferences

"appDefaultPreferences" section stores the default for all sorts of settings. For instance, while some applications would prefer to show the Overview Window by dafault, others might not. These values are used inside the settings component related [ in source ]code](../src/app/operation-tabs/settings-tab/settings-tab.component.ts).

ToDo

## Look & Feel

By changing [model description file](../src/assets/model_description.json) and executing [style generator file](../src/style-generator.js), you can change how nodes/edges will look like. You might change the labels of nodes and edges. For people, we show *name* of the person as its label. The line `"label": "data(name)",` which is on path *classes>Person>style* inside [model description file](../src/assets/model_description.json) sets label. If we change that line to `"label": "data(born)"` , it will show birth year of a person as its label. Here, *data* is [a mapper provided by cytoscape](https://js.cytoscape.org/#style/mappers). Each cytoscape element has a *data* function which returns associated data with the element. Below image shows the result of chaning label.

<p align="center">
    <img src="image/change-label.png" width="800"/>
</p>

You can change many other styles. `"text-valign"` property sets vertical alignment of labels. `"font-size"` sets font size of labels. `"shape"` sets shape of a node. `"background-image"` sets background image for a node. You can see more details about styles in [cytoscape.js documentation](https://js.cytoscape.org/#style)

You can also change styles of edges. Node and edges have some common style properties like `label` and `width` . A static value might be set for label. Style `"label": "acted in",` sets label a static string "acted in". Edges also have some styles which are not defined for nodes. For example `line-color` , `line-style` are only defined for edges. There are detailed explanations in [cytoscape.js documentation](https://js.cytoscape.org/#style/edge-line).

## Menus

[Navigation bar](../src/app/navbar/navbar.component.html) and [tool bar](../src/app/navbar/navbar.component.html) menus are customizable. Each component uses files that names ends with `.customization.service.ts`. Customization services are generated specifically to prevent merge conflicts which might occur in the future. 

To add new items to navigation bar menu, modify [navbar-customization.service.ts file](../src/app/navbar/navbar-customization.service.ts). Adding new items can be achived by adding new items to `_menu` array.

`this._menu = [ 
  { dropdown: 'File', actions: [{ txt: 'Custom Action 1', id: '', fn: 'fn1', isStd: false }] },
  { dropdown: 'Custom DropDown 1', actions: [{ txt: 'Custom Action 2', id: '', fn: 'fn2', isStd: false }]}
];`

Here if the `dropdown` already exists, it will be pushed below that dropdown. If `dropdown` does not exists, a new dropdown item will be generated. One important thing is the functions of the menu items should be parameterless. Another important thing is `isStd` property of custom items must be `false` to distinguish them from standard items.

There are only minimal number of menu items but you can remove items by modifying the file [navbar.component.ts file](../src/app/navbar/navbar.component.ts). This might cause some merge conflicts in the future. It is developers' responsiblity.

You can add new items to tool bar in the same manner. 
`this._menu = [{
   div: 12, items: [{ title: 'Custom Action 1', isRegular: true, fn: 'fn1', isStd: false, imgSrc: 'assets/img/logo.png' }]
 },
 {
   div: 1, items: [{ title: 'Custom Action 2', isRegular: true, fn: 'fn2', isStd: false, imgSrc: 'assets/img/logo.png' }]
 }];`

<p align="center">
    <img src="image/menu-customization.png" width="800"/>
</p>

## Context Menus
Context menus can also customized in a similar way to navbar menu and toolbar menu. Context menu functionality is provided by using [context menu cytoscape.js extension](https://github.com/iVis-at-Bilkent/cytoscape.js-context-menus). [context-menu.service.ts file](../src/app/context-menu/context-menu.service.ts) contains essential menu items. [context-menu-customization.service.ts file](../src/app/context-menu/context-menu-customization.service.ts) contains custom items. You can modify and check [context-menu-customization.service.ts file](../src/app/context-menu/context-menu-customization.service.ts) file to add more context menu items.

## Query Tab
[Query tab component](../src/app/operation-tabs/query-tab/query-tab.component.ts) and also queries inside the query tab designed to be completely customized. Each query should be an *angular component*. *Angular component* should have the path "../src/app/operation-tabs/query-tab/". For example there are 2 queries in this project. [Query0](../src/app/operation-tabs/query-tab/query0/query0.component.ts) and [Query1](../src/app/operation-tabs/query-tab/query1/query1.component.ts). Name of the components are not have to follow a format. But in order for them to be visible, they should be putted inside [query tab component html file](../src/app/operation-tabs/query-tab/query-tab.component.ts) in format like `<app-query0 *ngIf="selectedIdx==0"></app-query0> <app-query1 *ngIf="selectedIdx==1"></app-query1>`. Also, their display names should be added to [query tab component file](../src/app/operation-tabs/query-tab/query-tab.component.ts). For example, there are 2 queries in the file. `this.queryTypes = ['Get actors by movie counts', 'Get movies by genre'];`

## App Default Settings
There is a *userPref* section inside [model description file](../src/assets/model_description.json). This section stores user preferences. These values are shown to the user in [settings component html file](../src/app/operation-tabs/settings-tab/settings-tab.component.html). These settings are injected to visuall dynamically. So when you change a setting from model description file, you can observe the change in user interface after reloading the website. To make these settings user based, the section inside the model description file might be moved to somewhere else in future.

<p align="center">
    <img src="image/settings.png" width="407"/>
</p>


font styling


- **timebar_min**: Minimum begin date of graph objects in [Unix time stamp in milliseconds](https://currentmillis.com/),
- **timebar_max**: Maximum begin date of graph objects in [Unix time stamp in milliseconds](https://currentmillis.com/).

movie rating -> size