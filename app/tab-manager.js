import properties from "../assets/generated/properties";


export default class TabManager {

    constructor(){
        this.initProperties(properties);

        this.initFilterTab();
    }

    initProperties(properties){
        this.nodeProperties = properties;
    }

    initFilterTab(){
        const props = this.nodeProperties;
        let propDiv = $('<div class="form-check"><b>Classes</b><br></div>');

        // Create filter for class types
        for(const prop in props){
            let checkbox = $('<input class="form-check-input" type="checkbox" value="" id="" checked>');
            checkbox.attr({
                id: prop + 'Check',
                value: prop
            });

            let label = $('<label class="form-check-label" for="">' + prop + '</label>');
            label.attr({
                for: prop + 'Check'
            });

            propDiv.append(checkbox, label, '<br>');
        }

        // Create filter for attributes
        propDiv.append('<br><b>Attributes</b><br>');
        for(const prop in props){
            for(const value in props[prop]){
                let div = $('<div class="form-group row"></div>');

                let label = $('<label class="col-4 col-form-label" for="">' + value + '</label>');
                label.attr({
                    for: value + 'Form',
                });

                let input = $('<div class="col-6"><input type="text" class="form-control" id="" placeholder=""></div>');
                input.attr({
                    id: value + 'Form',
                    placeholder: value
                });

                div.append(label, input);
                propDiv.append(div);
            }
        }

        $('#filter').append(propDiv);
    }
}


// Handle Tab functionality
// Node & Edge classes

// Node properties for each class
// Edge properties for each class