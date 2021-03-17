export interface FormControlModel {
    name: string,
    value: any;
    label: string;
    required: boolean;
    type: 'input' | 'select' | 'multiple-select' | 'textarea' | 'checkbox';

    //Select Fields only
    selectOptions?: any[];

    //TextArea Fields only
    rows?: number;

    //Input Fields only
    inputType?: string;
    hasAutocomplete?: boolean;
    autocompleteLocal?: boolean;
    autocompleteConfig?: {
        url?: string;
        returnType: 'string' | any[];
        localAutocompletePool?: any[];
    };
    //Not sent in JSON
    autoCompleteOptions?: any[];

    //Checkboxes only
    multipleChoiceCheckbox?: boolean;
    checkboxOptions?: string[];
    hasOtherField?: boolean;
    //Not sent in JSON
    checkboxCheckedValues?: boolean[];

    //Added to dynamically show/hide elements
    isDateInput?: boolean
    shouldShow?: boolean;
    affectedControlNames?: string[];
    valueThatEnablesAffectedControls?: string;
}

