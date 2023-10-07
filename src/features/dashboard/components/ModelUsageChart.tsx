import { api } from "@/src/utils/api";

import {
  dateTimeAggregationSettings,
  type DateTimeAggregationOption,
} from "@/src/features/dashboard/lib/timeseries-aggregation";
import { type FilterState } from "@/src/features/filters/types";

import {
  getAllModels,
  reduceData,
  transformMapAndFillZeroValues,
} from "@/src/features/dashboard/components/hooks";
import { DashboardCard } from "@/src/features/dashboard/components/cards/DashboardCard";
import { numberFormatter, usdFormatter } from "@/src/utils/numbers";
import { TabComponent } from "@/src/features/dashboard/components/TabsComponent";
import { BaseTimeSeriesChart } from "@/src/features/dashboard/components/BaseTimeSeriesChart";

export const ModelUsageChart = ({
  className,
  projectId,
  globalFilterState,
  agg,
}: {
  className?: string;
  projectId: string;
  globalFilterState: FilterState;
  agg: DateTimeAggregationOption;
}) => {
  const tokens = api.dashboard.chart.useQuery({
    projectId,
    from: "observations",
    select: [
      { column: "totalTokens", agg: "SUM" },
      { column: "totalTokenCost", agg: null },
      { column: "model", agg: null },
    ],
    filter: globalFilterState ?? [],
    groupBy: [
      {
        type: "datetime",
        column: "startTime",
        temporalUnit: dateTimeAggregationSettings[agg].date_trunc,
      },
      {
        type: "string",
        column: "model",
      },
    ],
    orderBy: [{ column: "totalTokenCost", direction: "DESC", agg: null }],
    limit: null,
  });

  const allModels = getAllModels(projectId, globalFilterState);

  const transformedTotalTokens =
    tokens.data && allModels
      ? transformMapAndFillZeroValues(
          reduceData(tokens.data, "sumTotalTokens"),
          allModels,
        )
      : [];

  const transformedModelCost =
    tokens.data && allModels
      ? transformMapAndFillZeroValues(
          reduceData(tokens.data, "totalTokenCost"),
          allModels,
        )
      : [];

  const totalCost = tokens.data?.reduce(
    (acc, curr) => acc + (curr.totalTokenCost as number),
    0,
  );

  const totalTokens = tokens.data?.reduce(
    (acc, curr) => acc + (curr.sumTotalTokens as number),
    0,
  );

  const data = [
    {
      tabTitle: "Token cost",
      data: transformedModelCost,
      totalMetric: totalCost ? usdFormatter(totalCost) : "-",
      metricDescription: "Total cost",
      formatter: usdFormatter,
    },
    {
      tabTitle: "Token count",
      data: transformedTotalTokens,
      totalMetric: totalTokens ? numberFormatter(totalTokens) : "-",
      metricDescription: "Total tokens",
    },
  ];

  return (
    <DashboardCard
      className={className}
      title={"Model Usage"}
      isLoading={tokens.isLoading}
    >
      <TabComponent
        tabs={data.map((item) => {
          return {
            tabTitle: item.tabTitle,
            totalMetric: item.totalMetric,
            metricDescription: item.metricDescription,
            content: (
              <BaseTimeSeriesChart
                agg={agg}
                data={item.data}
                showLegend={true}
              />
            ),
          };
        })}
      />
    </DashboardCard>
  );
};
