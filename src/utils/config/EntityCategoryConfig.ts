//Generated by WriteToModelconfig_ts - ModelConfig.ts
import { ModelConfig } from "@/interfaces/ModelConfig";

export const EntityCategoryConfig: ModelConfig = {
    //Generated by GetSeqmodelkeys
seqModelID: 95,
modelName: "EntityCategory",
tableName: "entity_categories",
timestamps: true,
pluralizedModelName: "EntityCategories",
modelPath: "entity-categories",
variableName: "entityCategory",
isMainQuery: false,
sortString: "name",
slugField: "name",
variablePluralName: "entityCategories",
verboseModelName: "Entity Category",
pluralizedVerboseModelName: "Entity Categories",
navItemOrder: null,
capitalizedName: "ENTITYCATEGORY",
isRowAction: false,
isTable: false,
navItemIcon: null,
containerWidth: null,
limit: null,
isModal: null,
creationOrder: 1,
disableAPIDelete: null,
isMasterList: null,
    hooks: [],
    fields: [//Generated by GetAllSeqModelFieldKeys
{
seqModelFieldID: 375,
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
importFieldName: "EntityCategoryName",
seqModelFieldGroupID: null,
},
{
seqModelFieldID: 377,
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
importFieldName: "EntityCategoryID",
seqModelFieldGroupID: null,
},],
    filters: [//Generated by GetAllSeqModelFilterKeys
{
seqModelFilterID: 325,
seqModelID: 95,
seqModelFieldID: 375,
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
seqModelSortID: 53,
seqModelFieldID: 375,
modelFieldCaption: "Name",
modelSortOrder: 1,
sortKey: null,
},],
    fieldGroups: [],
}
