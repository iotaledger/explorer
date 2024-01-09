import React from "react";
import { RouteComponentProps } from "react-router";
import TabbedSection from "../../../components/hoc/TabbedSection";
import { InfluxChartsTab } from "../../../components/stardust/statistics/InfluxChartsTab";
import { TokenDistributionTab } from "../../../components/stardust/statistics/TokenDistributionTab";
import "./StatisticsPage.scss";

enum STATISTICS_PAGE_TABS {
  Charts = "Charts",
  TokenDistribution = "Token distribution",
}

interface StatisticsPageProps {
  network: string;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = () => (
  <div className="statistics-page">
    <div className="wrapper">
      <div className="inner">
        <div className="statistics-page--header">
          <div className="row middle">
            <h1>Statistics</h1>
          </div>
        </div>
        <TabbedSection tabsEnum={STATISTICS_PAGE_TABS}>
          <InfluxChartsTab />
          <TokenDistributionTab />
        </TabbedSection>
      </div>
    </div>
  </div>
);

export default StatisticsPage;
