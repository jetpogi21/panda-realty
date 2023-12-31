//Generated by WriteToModelinterface_ts - ModelInterface.ts Next 13


import { ListQuery } from "./interface";

export interface PropertyModel {
  //Generated by GetAllModelFieldTypeBySeqModel
id: number | string;//Generated by GetModelFieldType
street_address: string;//Generated by GetModelFieldType
suburb: string;//Generated by GetModelFieldType
state: string;//Generated by GetModelFieldType
postcode: string;//Generated by GetModelFieldType
property_type: string;//Generated by GetModelFieldType
bed: number | string;//Generated by GetModelFieldType
bath: number | string;//Generated by GetModelFieldType
car: number | string;//Generated by GetModelFieldType
building_area: string;//Generated by GetModelFieldType
land_use: string | null;//Generated by GetModelFieldType
zoning: string | null;//Generated by GetModelFieldType
development_zone: string | null;//Generated by GetModelFieldType
primary_plan: string | null;//Generated by GetModelFieldType
rpd: string | null;//Generated by GetModelFieldType
valuation_no: string | null;//Generated by GetModelFieldType
valuation_type: string | null;//Generated by GetModelFieldType
valuation_amount: string | null;//Generated by GetModelFieldType
valuation_date: string | null;//Generated by GetModelFieldType
slug: string;
createdAt: string;
updatedAt: string;
  
  
  
}

//The keys after the updatedAt is generated by GetAllRelatedModelNameBySeqModel - RelatedModelName
export interface PropertyFormikShape extends Omit<PropertyModel, "slug" | "createdAt" | "updatedAt" 
 
> {
  touched: boolean;
  index: number;
}

//Use for continuos list form
export interface PropertyFormikInitialValues {
  Properties: PropertyFormikShape[];
  
}

//The FormikInitialValues is generated by GetAllRelatedFormikInitialValues - ModelFormikInitialValue
export interface PropertyFormFormikInitialValues
  extends Omit<PropertyFormikShape, "touched" | "index"> {
  
}

//The extends portion is generated by GetModelUpdatePayloadExtension - GetRelatedPartialPayload
export interface PropertyUpdatePayload  {
  Properties: Omit<PropertyFormikShape, "touched">[];
  
}

export interface PropertyDeletePayload {
  deletedProperties: string[] | number[];
}

export interface PropertySelectedPayload {
  selectedProperties: string[] | number[];
}

//Use for single form (with children)
//The Related Models will be replaced by the Payload version
export interface PropertyFormUpdatePayload
  extends Omit<PropertyFormikShape, "touched" | "index" 
> 
 
{
  
}

export interface PropertyFormikFilter {
  //Generated by GetAllFilterInterfaceBySeqmodel
q: string
}

export interface PropertySearchParams
  extends ListQuery,
    Omit<PropertyFormikFilter, ""> {
  //Generated by GetAllNonStringFilterTypes

}

export interface GetPropertiesResponse {
  count: number;
  rows: PropertyModel[];
  cursor: string;
}
