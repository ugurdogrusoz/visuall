# Visu*all* Developer Guide

This guide details how a custom application can be built using Visu*all*. We assume the reader has already gone over [User Guide](UG.md), and in each of the following sections, we describe how to customize various parts of a Visu*all* based visual analysis tool.

## Data Model
To visualize data, structre of data must be expressed inside [model description file](../src/assets/model_description.json). With command `node style-generator.js /assest/model_description.json`, [style generator file](../src/style-generator.js) reads [model description file](../src/assets/model_description.json). And [style generator file](../src/style-generator.js) modifies [index.html file](../src/index.html), [styles.css file](../src/styles.css), [properties.json file](../src/assets/generated/properties.json) and [stylesheet.json file](../src/assets/generated/stylesheet.json). These files used in source codes for customization purposes.

[Model description file](../src/assets/model_description.json) file contains *classes* and *relations* sections. *classes* section contains data stuctures of nodes.
Each *class* corresponds to a node type in graph. *relations* section contains data strcutures of edges. Each *relation* corresponds to an edge type in graph. For the movie dataset there 2 classes of nodes: *Person* and *Movie*. Each *class* have *properties* and *style*. Each *property* has a name and data type. For example *Person* class has 4 properties: name, born, start_t and end_t  

A *property* might have different data types: *string*, *int*, *float*, *datetime* and *enum*. *string*, *float*, *int* are standard types which usually exist in programming languages. *datetime* is actually an integer 
which represents date in [Unix time stamp in milliseconds](https://currentmillis.com/). *enum* is a special type which indicates values in this property should be mapped. *enum* type should be in format like *enum,string*. This means this property values are mapped from original values which have type *string*, to some other values. This mapping of values should be defined in the section named *finiteSetPropertyMapping* inside [model description file](../src/assets/model_description.json). 

You can also define style of your nodes. There is *style* field for each class of node. These styles are being used as [cytoscape style](https://js.cytoscape.org/#style). These styles designate how the nodes are going to be shown in the canvas.

*relations* section of the [model description file](../src/assets/model_description.json) is very similar to *classes* section. *relations* section stores information about edges. Each *relation* has *property* and *style* exactly like a *class*. In addition, each *relation* also has *source*, *target* and *isBidirectional* fields. These are used to represent direction information of an edge.

*timebarDataMapping* section of the file is used for representing lifetime of a node or edge. Lifetime information is being used in [timebar service](../src/app/timebar.service.ts) to show some graphics and statistics. Ideally, each *class* or each *relation* would have 2 datetime properties which represents start and end. These are named as *begin_datetime* and *end_datetime*. If these fields do not exist, visuall will use default begin and end times for timebar.

*finiteSetPropertyMapping* section of the file is used to map values. For example, a status code might consists of numbers like 1,2,3 etc.. But you might want to show values like 'Active', 'Deactive', 'Suspend' etc.... Here you put mappings for each *property* of each *class*/*relation*. This is totally optional. You might not want to use any mapping and just use the values as is.

*generalStyles* section of the file is being used as [cytoscape style](https://js.cytoscape.org/#style). You might chage values inside this file according to your needs. You might add/delete some properties but adding/deleting might harm integrity of the application. It is on the developer's responsiblity. On the other hand, changing existing values would less likely to cause any harm.

*userPref* section of the file is being used to store user preferences. These values are used inside [settings component in source code](../src/app/operation-tabs/settings-tab/settings-tab.component.ts). If we need to store user specific settings they might be moved to somewhere else.

## Look & Feel

## Menus

## Context Menus

## Query Tab

## Default Settings
