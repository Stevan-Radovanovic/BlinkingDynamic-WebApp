export interface SendOfferRequestModel {
    instanceId: string;
    amount: number;
    paymentPeriod: number;
    productCode: string;
    realizationMethod: string;
}

export interface SendOfferResponseModel {
    successful: boolean;
    error: string;
}