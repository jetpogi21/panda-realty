//Generated by WriteToModelstateholder_tsx - ModelStateHolder.tsx
"use client";
import EntityCategoryFilterForm from "@/components/entity-categories/EntityCategoryFilterForm";
import EntityCategoryTable from "@/components/entity-categories/EntityCategoryTable";
import { useTableProps } from "@/hooks/useTableProps";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { EntityCategoryModel } from "@/interfaces/EntityCategoryInterfaces";
import React from "react";

const EntityCategoryStateHolder = ({ modelConfig }: { modelConfig: ModelConfig }) => {
  const tableStates = useTableProps<EntityCategoryModel>(modelConfig);
  return (
    <>
      <h1 className="text-2xl font-bold">
        {modelConfig.pluralizedVerboseModelName}
      </h1>
      <div className="flex">
        <EntityCategoryFilterForm tableStates={tableStates} />
      </div>
      <div className="flex flex-col flex-1 ">
        <EntityCategoryTable tableStates={tableStates} />
      </div>
    </>
  );
};

export default EntityCategoryStateHolder;
