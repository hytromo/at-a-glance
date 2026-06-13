"use client";

import { ResponsiveLineCanvas, Serie } from "@nivo/line";
import {
  format as dateFormat,
  startOfHour,
  startOfDay,
  endOfDay,
  add,
} from "date-fns";

import { DateTime } from "luxon";

import { useContext, useEffect, useMemo, useState } from "react";
import { InitDataContext } from "../app/data/init-data-context";
import { ThemeContext } from "../app/theme-context";
import { getMargin, getTheme } from "./nivo-theme";

type SpotPriceRecord = {
  date: string;
  localDate: string;
  PriceArea: string;
  price: {
    total: number;
  };
};

type SpotPricesDto = {
  prices: SpotPriceRecord[];
};

type HourTotals = Array<{
  hour: Date;
  priceSumEur: number;
  totalRecords: number;
}>;

const calculateMiddleColor = ({
  color1 = "FF0000",
  color2 = "00FF00",
  ratio,
}: {
  color1: string;
  color2: string;
  ratio: number;
}) => {
  const hex = (color: number) => {
    const colorString = color.toString(16);
    return colorString.length === 1 ? `0${colorString}` : colorString;
  };

  const r = Math.ceil(
    parseInt(color2.substring(0, 2), 16) * ratio +
      parseInt(color1.substring(0, 2), 16) * (1 - ratio),
  );
  const g = Math.ceil(
    parseInt(color2.substring(2, 4), 16) * ratio +
      parseInt(color1.substring(2, 4), 16) * (1 - ratio),
  );
  const b = Math.ceil(
    parseInt(color2.substring(4, 6), 16) * ratio +
      parseInt(color1.substring(4, 6), 16) * (1 - ratio),
  );

  return hex(r) + hex(g) + hex(b);
};

export default function ElPrice() {
  const { theme, isMobile } = useContext(ThemeContext);
  const [prices, setPrices] = useState<Serie[] | null>();
  const [maxPricePerDay, setMaxPricePerDay] = useState({
    today: -1,
    tomorrow: -1,
    yesterday: -1,
  });
  const [goodPriceRanges, setGoodPriceRanges] = useState<
    Array<{ from: Date; to: Date }>
  >([]);
  const { priceArea, timezone } = useContext(InitDataContext);

  useEffect(() => {
    const doFetch = () => {
      const spotPricesURL = new URL(
        "/at-a-glance/spot-prices.json",
        window.location.origin,
      );
      const params = {
        cacheBust: new Date().toISOString(),
      };

      for (const param in params) {
        spotPricesURL.searchParams.set(
          param,
          params[param as keyof typeof params],
        );
      }

      fetch(spotPricesURL)
        .then((res) => res.json())
        .then((data: SpotPricesDto) => {
          const prices: Serie[] = [
            { id: "Past", data: [] },
            { id: "Future", data: [] },
          ];

          const records = data.prices;
          const now = DateTime.now().setZone("utc");

          for (const recordIndex in records) {
            const record = records[recordIndex];
            const date = DateTime.fromISO(record.date).setZone(timezone);
            console.log(
              "record utc",
              record.date,
              "date format",
              date.toFormat("yyyy-MM-dd HH:mm"),
            );
            const timeMomentIndexToAddRecordTo = [];
            if (date <= now) {
              timeMomentIndexToAddRecordTo.push(0);
            } else {
              timeMomentIndexToAddRecordTo.push(1);
            }

            for (const index of timeMomentIndexToAddRecordTo) {
              console.log("Setting price to", record.price.total);
              (prices[index].data as any).push({
                x: new Date(date.toFormat("yyyy-MM-dd HH:mm")),
                y: record.price.total.toFixed(3),
              });
            }
          }

          setPrices(prices);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    const intervalId = setInterval(doFetch, 1000 * 60 * 30);

    doFetch();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!prices) {
      return;
    }
    const _maxPricePerDay = { today: -1, tomorrow: -1, yesterday: -1 };
    const now = DateTime.now().setZone(timezone);
    const yesterday = now.minus({ days: 1 });
    for (const momentOfTime of prices) {
      for (const price of momentOfTime.data) {
        if (typeof price.y === "number") {
          const day = DateTime.fromJSDate(price.x as Date).setZone(timezone);
          const dayId = day.hasSame(now, "day")
            ? "today"
            : day.hasSame(yesterday, "day")
              ? "yesterday"
              : "tomorrow";
          if (price.y > _maxPricePerDay[dayId]) {
            _maxPricePerDay[dayId] = price.y;
          }
        }
      }
    }
    setMaxPricePerDay(_maxPricePerDay);
  }, [prices]);

  const colors = useMemo(() => {
    const _colors: string[] = [];
    if (!prices) {
      return undefined;
    }

    for (const day of prices) {
      if (day.id === "Past" && day.data.length > 1) {
        _colors.push("#FFC94A");
      } else if (day.id === "Future" && day.data.length > 1) {
        _colors.push("#7AA2E3");
      }
    }

    return _colors;
  }, [prices]);

  const allDataPoints = useMemo(() => {
    return prices?.reduce(
      (acc, serie) => {
        return acc.concat(serie.data as any);
      },
      [] as { x: Date; y: number }[],
    );
  }, [prices]);

  if (!prices) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "80%" }}>
        <ResponsiveLineCanvas
          data={prices}
          enableCrosshair
          crosshairType="top-left"
          pixelRatio={3}
          margin={getMargin(isMobile)}
          curve="monotoneX"
          enableArea
          theme={getTheme(theme, isMobile)}
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
            tickValues: isMobile
              ? undefined
              : allDataPoints?.map((d) => d.x) || [],
            legend: "Hour",
            legendPosition: "middle",
            legendOffset: isMobile ? 20 : 40,
          }}
          axisLeft={{
            legend: "Price in kr/KWh",
            legendPosition: "middle",
            legendOffset: isMobile ? -32 : -55,
          }}
          pointBorderWidth={1}
          tooltip={(d) => {
            const pointDay = DateTime.fromJSDate(
              d.point.data.x as Date,
            ).setZone(timezone);
            const now = DateTime.now().setZone(timezone);
            const yesterday = now.minus({ days: 1 });
            const tomorrow = now.plus({ days: 1 });
            const whenDay: "today" | "yesterday" | "tomorrow" =
              [
                { day: now, t: "today" as const },
                { day: tomorrow, t: "tomorrow" as const },
                { day: yesterday, t: "yesterday" as const },
              ].find(
                (d) => pointDay.toFormat("MMDD") === d.day.toFormat("MMDD"),
              )?.t || "today";

            return `${parseFloat(d.point.data.y as string).toFixed(3)} kr/KWh ${Math.round(
              ((d.point.data.y as number) /
                (maxPricePerDay[whenDay] as number)) *
                100,
            )}% of max at ${d.point.data.x}`;
          }}
          colors={colors}
        />
      </div>
      <p style={{ textAlign: "center" }}>
        Data from{" "}
        <a style={{ color: "magenta" }} href="https://stromligning.dk">
          https://stromligning.dk
        </a>
      </p>
    </div>
  );
}
