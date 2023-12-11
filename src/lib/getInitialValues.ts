import { BasicModel, UnknownObject } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { getChildModels } from "@/lib/getChildModels";
import { getChildModelsWithSimpleRelationship } from "@/lib/getChildModelsWithSimpleRelationship";
import { sortFunction } from "@/lib/sortFunction";
import {
  findModelPrimaryKeyField,
  findConfigItemObject,
  convertDateToYYYYMMDD,
  findRelationshipModelConfig,
  replaceHighestOrder,
  findLeftForeignKeyField,
} from "@/utils/utilities";

//leftFieldName is for setting the default value of the parent model to 0
interface GetInitialValuesOption {
  requiredList?: Record<string, BasicModel[]>;
  childMode?: boolean;
  leftFieldName?: string;
  skipEmptyRow?: boolean;
  defaultValues?: Record<string, unknown>;
}

function handleRequiredList(
  requiredList: Record<string, BasicModel[]> | undefined,
  listKey: string,
  fieldName: string,
  initialValues: Record<string, unknown>
) {
  if (requiredList) {
    const requiredModelList = requiredList[listKey];
    if (requiredModelList.length > 0) {
      initialValues[fieldName] = requiredModelList[0].id;
      return true;
    }
    initialValues[fieldName] = "";
    return true;
  }
  return false;
}

export const getInitialValues = <T>(
  modelConfig: ModelConfig,
  record?: T,
  options?: GetInitialValuesOption
) => {
  const primaryKeyField = findModelPrimaryKeyField(modelConfig).fieldName;
  const initialValues: UnknownObject = {};
  modelConfig.fields.forEach(
    ({
      allowNull,
      fieldName,
      dataType,
      relatedModelID,
      orderField,
      dataTypeOption,
      allowedOptions,
      controlType,
    }) => {
      const defaultValues = options?.defaultValues;
      if (record) {
        initialValues[fieldName] = record[fieldName as keyof T];
        if (defaultValues) {
          const defaultValueKeys = Object.keys(defaultValues);
          for (const key of defaultValueKeys) {
            if (!initialValues[key]) {
              initialValues[key] = defaultValues[key];
            }
          }
        }

        //also check of controlType is autocomplete
        if (
          controlType === "Autocomplete" &&
          relatedModelID &&
          record[fieldName as keyof T]
        ) {
          const relatedModelConfig = findConfigItemObject(
            AppConfig.models,
            "seqModelID",
            relatedModelID
          );
          const { modelName } = relatedModelConfig;
          initialValues[modelName] = record[modelName as keyof T];
        }
        return;
      }

      if (defaultValues !== undefined) {
        const value = defaultValues[fieldName];
        if (value !== undefined) {
          initialValues[fieldName] = value;
          return;
        }
      }

      if (fieldName === options?.leftFieldName) {
        initialValues[fieldName] = 0;
        return;
      }

      if (allowNull) {
        initialValues[fieldName] = null;
        return;
      }

      if (orderField) {
        initialValues[fieldName] = 0;
        return;
      }

      if ((dataTypeOption && dataType === "ENUM") || allowedOptions) {
        if (
          handleRequiredList(
            options?.requiredList,
            `${fieldName}List`,
            fieldName,
            initialValues
          )
        ) {
          return;
        }
      }

      if (relatedModelID) {
        const relatedModelConfig = findConfigItemObject(
          AppConfig.models,
          "seqModelID",
          relatedModelID
        );
        const variableName = relatedModelConfig.variableName;

        if (
          handleRequiredList(
            options?.requiredList,
            `${variableName}List`,
            fieldName,
            initialValues
          )
        ) {
          return;
        }
      }

      if (dataType === "BOOLEAN") {
        initialValues[fieldName] = false;
        return;
      }

      if (dataType === "DATEONLY") {
        initialValues[fieldName] = convertDateToYYYYMMDD(new Date());
        return;
      }

      if (dataType === "DECIMAL") {
        initialValues[fieldName] = "0.00";
        return;
      }

      initialValues[fieldName] = "";
    }
  );

  //Do this only if not childMode
  if (!options?.childMode) {
    getChildModels(modelConfig, { formMode: true }).forEach(
      ({ seqModelRelationshipID, leftForeignKey }) => {
        const leftModelConfig = findRelationshipModelConfig(
          seqModelRelationshipID,
          "LEFT"
        );
        const leftFieldName = findLeftForeignKeyField(
          seqModelRelationshipID
        ).fieldName;
        const { pluralizedModelName } = leftModelConfig;

        if (record) {
          const rows = record[pluralizedModelName as keyof T] as Record<
            string,
            unknown
          >[];
          initialValues[pluralizedModelName] = rows
            .sort(sortFunction(leftModelConfig.sortString, leftModelConfig))
            .map((item, index) => ({
              ...item,
              touched: false,
              index,
            }));
        } else {
          if (!options?.skipEmptyRow) {
            initialValues[pluralizedModelName] = [
              {
                ...(getInitialValues(leftModelConfig, undefined, {
                  childMode: true,
                  leftFieldName,
                  requiredList: options?.requiredList,
                }) as T),
                index: 0,
              },
            ];
          } else {
            initialValues[pluralizedModelName] = [];
          }
        }
        //Always add an empty row if there's a record
        if (record) {
          if (!options?.skipEmptyRow) {
            const draggableField = leftModelConfig.fields.find(
              (field) => field.orderField
            );

            const initialValuesRows = initialValues[
              pluralizedModelName
            ] as Record<string, unknown>[];

            const leftFieldName = findLeftForeignKeyField(
              seqModelRelationshipID
            ).fieldName;

            const newRow: Record<string, unknown> = {
              ...(getInitialValues(leftModelConfig, undefined, {
                childMode: true,
                requiredList: options?.requiredList,
              }) as T),
              index: initialValuesRows.length + 1,
              [leftFieldName]: record[primaryKeyField as keyof T],
            };

            if (draggableField) {
              newRow[draggableField.fieldName] = replaceHighestOrder(
                initialValuesRows,
                draggableField.fieldName
              );
            }
            initialValuesRows.push(newRow);
          }
        }
      }
    );
  }

  //Do this only if not childmode meaning you will generate the children rows of the modelConfig
  if (!options?.childMode) {
    getChildModelsWithSimpleRelationship(modelConfig).forEach(
      ({ seqModelRelationshipID, fieldToBeInserted }) => {
        const leftModelConfig = findRelationshipModelConfig(
          seqModelRelationshipID,
          "LEFT"
        );
        const { pluralizedModelName } = leftModelConfig;
        if (record) {
          //@ts-ignore
          initialValues[pluralizedModelName] = record[pluralizedModelName].map(
            //@ts-ignore
            (item) => item[fieldToBeInserted]
          );
        } else {
          initialValues[pluralizedModelName] = [];
        }
      }
    );
  }

  return initialValues as T;
};
