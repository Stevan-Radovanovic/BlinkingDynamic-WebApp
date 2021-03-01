export interface CalculateOfferRequestModel {
    
    instanceId: string;
    amount: number;
    paymentPeriod: number;
    productCode: string;

}

export interface CalculateOfferResponseModel {
    annuity: number;
    effectiveInterestRate: number;
    totalInterest: number;
    totalRepayment: number;
    totalFees: number;
    feeDetails?: FeeDetailsModel;
    successful: boolean;
    error: string;

}

export interface FeeDetailsModel {
    title: string;
    amount: number;
}