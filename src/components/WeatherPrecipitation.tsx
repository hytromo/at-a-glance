"use client";

import { ResponsiveLineCanvas } from "@nivo/line";

import { DateTime } from "luxon";
import { useContext } from "react";
import { InitDataContext } from "../app/data/init-data-context";
import { ThemeContext } from "../app/theme-context";
import { WeatherContext } from "./WeatherCombo";
import { getTheme } from "./nivo-theme";

export default function WeatherPrecipitation() {
  const { timezone } = useContext(InitDataContext);
  const { theme } = useContext(ThemeContext);

  return (
    <WeatherContext.Consumer>
      {({ precipitation }) => (
        <ResponsiveLineCanvas
          data={precipitation}
          enableCrosshair
          crosshairType="top-left"
          pixelRatio={1}
          margin={{ bottom: 60, left: 80, right: 30, top: 30 }}
          curve="monotoneX"
          enableArea
          axisLeft={{
            legend: "Precipitation in %",
            legendPosition: "middle",
            legendOffset: -55,
          }}
          tooltip={(d) => `${d.point.data.y}%`}
          theme={getTheme(theme)}
          xScale={{
            type: "time",
            format: "native",
            precision: "minute",
          }}
          axisBottom={{
            format: (props) => {
              const date = DateTime.fromJSDate(props).setZone(timezone);
              if (date.minute != 0) {
                return "";
              }
              return date.toFormat("H");
            },
            tickSize: 5,
            tickRotation: 90,
            tickValues: "every 1 hour",
            legend: "Hour",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          yScale={{
            type: "linear",
            max: 100,
          }}
        />
      )}
    </WeatherContext.Consumer>
  );
}
