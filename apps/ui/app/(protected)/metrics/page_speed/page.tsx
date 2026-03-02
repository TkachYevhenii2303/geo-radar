"use client";

import SpeedChart from "@/components/shared/metrics/charts/SpeedChart";
import styles from "../metrics.module.scss";
import { Container, Grid } from "@mantine/core";

const chartsData = [
  {
    title: "Health Score",
    value: 93.94,
    tooltip:
      "Overall site health based on multiple SEO and performance factors",
  },
  {
    title: "Google SEO Rating",
    value: 83.88,
    tooltip: "Google's assessment of your site's search engine optimization",
  },
  {
    title: "Mobile Speed Performance",
    value: 62.53,
    tooltip: "Page load performance score for mobile devices",
  },
  {
    title: "Desktop Speed Performance",
    value: 28.88,
    tooltip: "Page load performance score for desktop browsers",
  },
];

export default function Page() {
  return (
    <Container size="xl" py="xl" className={styles.page}>
      <Grid gutter="md">
        {chartsData.map((chart) => (
          <Grid.Col key={chart.title} span={{ base: 12, sm: 6, lg: 3 }}>
            <SpeedChart
              key={chart.title}
              title={chart.title}
              value={chart.value}
              tooltip={chart.tooltip}
            />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
