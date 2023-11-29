import { FormikFormFieldGroupGrid } from "@/components/FormikFormFieldGroupGenerator";
import { TabsContent } from "@/components/ui/Tabs";
import { ModelConfig } from "@/interfaces/ModelConfig";

type FormikTabsContentProps<T> = {
  modelConfig: ModelConfig;
  tabFieldGroups: ModelConfig["fieldGroups"];
};

const FormikTabsContent = <T,>(props: FormikTabsContentProps<T>) => {
  const { tabFieldGroups, modelConfig } = props;

  /* 
<TabsContent value="account">
    Make changes to your account here.
    </TabsContent>
*/
  return tabFieldGroups.map((tabFieldGroup) => {
    const { groupName } = tabFieldGroup;
    return (
      <TabsContent
        key={groupName}
        value={groupName}
      >
        <FormikFormFieldGroupGrid
          modelConfig={modelConfig}
          fieldGroup={tabFieldGroup}
        />
      </TabsContent>
    );
  });
};

export default FormikTabsContent;
