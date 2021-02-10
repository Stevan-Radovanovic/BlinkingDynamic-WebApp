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
    autocompleteConfig?: {
        url: string;
        returnType: 'string' | any[];
    }
    //Not sent in JSON
    autoCompleteOptions?: any[];

    //Checkboxes only
    multipleChoiceCheckbox?: boolean;
    checkboxOptions?: string[];
    hasOtherField?: boolean;
    //Not sent in JSON
    checkboxCheckedValues?: boolean[];
}

