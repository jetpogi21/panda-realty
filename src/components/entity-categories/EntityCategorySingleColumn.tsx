//Generated by WriteToModelsinglecolumn_tsx - ModelSingleColumn.tsx
import { ModelSingleColumnProps } from "@/interfaces/GeneralInterfaces";
import { EntityCategoryModel } from "@/interfaces/EntityCategoryInterfaces";
import { EntityCategoryConfig } from "@/utils/config/EntityCategoryConfig";
import { generateModelSingleColumnFromFields } from "@/lib/generateModelSingleColumnFromFields";

const modelConfig = EntityCategoryConfig;

const EntityCategorySingleColumn = <T,>({ 
  cell,
relationshipConfig,
}: ModelSingleColumnProps<T>) => {
  const entityCategory = cell.row.original as EntityCategoryModel;

  /*
  //To fetch a certain related field when using a subform since direct object won't be accessible
  const subAccountTitle = getListItemFromLocalStorage(
    "sub-account-titles",
    "id",
    journalEntryItem,
    "sub_account_title_id"
  );
  */

  return (
    <div className="flex flex-col gap-1">
      {generateModelSingleColumnFromFields(modelConfig, entityCategory, relationshipConfig)}
    </div>
  );
};

export default EntityCategorySingleColumn;