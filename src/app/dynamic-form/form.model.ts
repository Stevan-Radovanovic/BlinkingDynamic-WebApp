import { FormControlModel } from "./form-control.model";

export class DynamicFormModel {
    title?: string;
    text?: string;
    controls: FormControlModel[];
}