import { TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ModelConfig } from "@/interfaces/ModelConfig";

type FormikTabsListProps<T> = {
  tabFieldGroups: ModelConfig["fieldGroups"];
};

const FormikTabsList = <T,>(props: FormikTabsListProps<T>) => {
  const { tabFieldGroups } = props;

  /* 
    <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList> 
    */

  const tabsTriggers = tabFieldGroups.map((tabFieldGroup) => {
    const { groupName } = tabFieldGroup;
    return (
      <TabsTrigger
        key={groupName}
        value={groupName}
      >
        {groupName}
      </TabsTrigger>
    );
  });

  return <TabsList className="mb-4">{tabsTriggers}</TabsList>;
};

export default FormikTabsList;
