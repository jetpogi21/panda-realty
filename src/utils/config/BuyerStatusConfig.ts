//Generated by WriteToModelconfig_ts - ModelConfig.ts
import { ModelConfig } from "@/interfaces/ModelConfig";

export const BuyerStatusConfig: ModelConfig = {
    //Generated by GetSeqmodelkeys
seqModelID: 98,
modelName: "BuyerStatus",
tableName: "buyer_status",
timestamps: true,
pluralizedModelName: "BuyerStatus",
modelPath: "buyer-status",
variableName: "buyerStatus",
isMainQuery: false,
sortString: "name",
slugField: "name",
variablePluralName: "buyerStatusList",
verboseModelName: "Buyer Status",
pluralizedVerboseModelName: "Buyer Status",
navItemOrder: 2,
capitalizedName: "BUYERSTATUS",
isRowAction: false,
isTable: false,
navItemIcon: null,
containerWidth: null,
limit: 10,
isModal: false,
creationOrder: 1,
disableAPIDelete: false,
isMasterList: true,
    hooks: [],
    fields: [//Generated by GetAllSeqModelFieldKeys
{
seqModelFieldID: 380,
unique: true,
fieldName: "name",
autoincrement: false,
primaryKey: false,
allowNull: false,
dataTypeOption: "(50)",
databaseFieldName: "name",
pluralizedFieldName: null,
allowedOptions: null,
fieldOrder: 1,
verboseFieldName: "Name",
fieldWidth: null,
relatedModelID: null,
hideInTable: false,
orderField: false,
dataType: "STRING",
dataTypeInterface: "string",
controlType: "Text",
columnsOccupied: 12,
summarizedBy: null,
importFieldName: "BuyerStatus",
seqModelFieldGroupID: null,
},
{
seqModelFieldID: 381,
unique: false,
fieldName: "id",
autoincrement: true,
primaryKey: true,
allowNull: false,
dataTypeOption: null,
databaseFieldName: "id",
pluralizedFieldName: null,
allowedOptions: null,
fieldOrder: 0,
verboseFieldName: "ID",
fieldWidth: null,
relatedModelID: null,
hideInTable: true,
orderField: false,
dataType: "INTEGER",
dataTypeInterface: "number",
controlType: "Hidden",
columnsOccupied: 12,
summarizedBy: null,
importFieldName: "BuyerStatusID",
seqModelFieldGroupID: null,
},],
    filters: [//Generated by GetAllSeqModelFilterKeys
{
seqModelFilterID: 329,
seqModelID: 98,
seqModelFieldID: 380,
filterQueryName: "q",
listVariableName: null,
filterOrder: 1,
filterCaption: "Name",
seqModelRelationshipID: null,
modelListID: null,
modelPath: null,
controlType: "Text",
variableName: null,
filterOperator: "Like",
"options": [],
},],
    sorts: [//Generated by GetAllSeqModelSortKeys
{
seqModelSortID: 55,
seqModelFieldID: 380,
modelFieldCaption: "Name",
modelSortOrder: 1,
sortKey: null,
},],
    fieldGroups: [],
}
