export interface FormControlModel {
    name: string,
    value: any;
    label: string;
    required: boolean;
    type: 'input' | 'select' | 'multiple-select' | 'textarea';

    //Select Fields only
    options?: any[];

    //TextArea Fields only
    rows?: number;
}