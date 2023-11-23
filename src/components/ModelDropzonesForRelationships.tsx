import ModelFileDropzone from "@/components/ModelFileDropzone";
import { ModelConfig } from "@/interfaces/ModelConfig";
import {
  findRelationshipModelConfig,
  findLeftForeignKeyField,
  findModelPrimaryKeyField,
} from "@/utils/utilities";
import { FormikProps } from "formik";
import { getChildModelsWithDropzone } from "@/lib/getChildModelsWithDropzone";

interface ModelDropzonesProps<T> {
  modelConfig: ModelConfig;
  formik: FormikProps<T>;
  handleHasUpdate: () => void;
}

const ModelDropzonesForRelationships = <T,>({
  modelConfig,
  formik,
  handleHasUpdate,
}: ModelDropzonesProps<T>) => {
  const primaryKeyField = findModelPrimaryKeyField(modelConfig).fieldName;
  return (
    <>
      {getChildModelsWithDropzone(modelConfig).map(
        ({ seqModelRelationshipID }) => {
          const leftModelConfig = findRelationshipModelConfig(
            seqModelRelationshipID,
            "LEFT"
          );

          const leftFieldName = findLeftForeignKeyField(
            seqModelRelationshipID
          ).fieldName;
          return (
            <ModelFileDropzone
              key={seqModelRelationshipID}
              formik={formik}
              modelConfig={leftModelConfig}
              handleUpdate={handleHasUpdate}
              defaultValue={{
                //@ts-ignore
                [leftFieldName]: formik.values?.[primaryKeyField] || 0,
              }}
            />
          );
        }
      )}
    </>
  );
};

export default ModelDropzonesForRelationships;
