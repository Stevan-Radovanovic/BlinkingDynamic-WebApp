import { ButtonType } from "./button-type.enum";

export interface DynamicPageModel {
    title: string;
    content: string;
    actions: {label: string, type: ButtonType}[];
}