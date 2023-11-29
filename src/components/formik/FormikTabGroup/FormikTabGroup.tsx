import FormikTabsContent from "@/components/formik/FormikTabGroup/FormikTabsContent";
import FormikTabsList from "@/components/formik/FormikTabGroup/FormikTabsList";
import { Tabs } from "@/components/ui/Tabs";
import { ModelConfig } from "@/interfaces/ModelConfig";

type FormikTabGroupProps = {
  modelConfig: ModelConfig;
};

const FormikTabGroup = (props: FormikTabGroupProps) => {
  const { modelConfig } = props;
  const tabFieldGroups = modelConfig.fieldGroups
    .filter((fieldGroup) => fieldGroup.asTab)
    .sort((a, b) => a.groupOrder - b.groupOrder);
  const defaultTabValue =
    tabFieldGroups.length > 0 ? tabFieldGroups[0].groupName : "";

  return tabFieldGroups.length > 0 ? (
    <Tabs
      defaultValue={defaultTabValue}
      className="w-full"
    >
      <FormikTabsList tabFieldGroups={tabFieldGroups} />
      {/* <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList> */}
      <FormikTabsContent
        tabFieldGroups={tabFieldGroups}
        modelConfig={modelConfig}
      />
    </Tabs>
  ) : null;
};

export default FormikTabGroup;
