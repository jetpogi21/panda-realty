import { FormikDateRangePicker } from "@/components/formik/FormikDateRangePicker";
import { FormikSelect } from "@/components/formik/FormikSelect";
import { FormikSwitch } from "@/components/formik/FormikSwitch";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";

interface RequiredList {
  [key: string]: BasicModel[];
}

interface FormikFilterControlGeneratorProps {
  requiredList?: RequiredList;
  config: ModelConfig;
}

export const FormikFilterControlGenerator = ({
  requiredList,
  config,
}: FormikFilterControlGeneratorProps) => {
  return config.filters
    .filter(
      ({ filterOrder, filterQueryName }) =>
        filterQueryName !== "q" && filterOrder
    )
    .sort(
      ({ filterOrder: filterOrder_1 }, { filterOrder: filterOrder_2 }) =>
        filterOrder_1 - filterOrder_2
    )
    .map(
      ({
        filterQueryName,
        filterCaption,
        controlType,
        variableName,
        options,
      }) => {
        switch (controlType) {
          case "Select":
            const realOptions =
              options.length > 0
                ? options.map((option) => ({
                    id: option.fieldValue,
                    name: option.fieldCaption,
                  }))
                : requiredList && variableName
                ? requiredList[variableName + "List"]
                : [];

            return (
              <FormikSelect
                key={filterQueryName}
                name={filterQueryName}
                options={realOptions}
                label={filterCaption!}
                showLabel={false}
                allowBlank={true}
              />
            );

          case "Switch":
            return (
              <FormikSwitch
                key={filterQueryName}
                containerClassNames={"flex-row w-auto"}
                name={filterQueryName}
                label={filterCaption!}
                size={"sm"}
              />
            );
          case "DateRangePicker":
            return (
              <FormikDateRangePicker
                key={filterQueryName}
                name={filterQueryName}
                label={filterCaption!}
                showLabel={false}
              />
            );
        }
      }
    );
};
