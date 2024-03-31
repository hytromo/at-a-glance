"use client";

import { ResponsiveLineCanvas, Serie } from "@nivo/line";

import { DateTime } from "luxon";

import { useContext, useEffect, useMemo, useState } from "react";
import { InitDataContext } from "../app/data/page";

type HourlyRecord = {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  SpotPriceDKK: number;
  SpotPriceEUR: number;
};

type SpotPrices = {
  total: number;
  filters: string;
  sort: string;
  limit: number;
  dataset: string;
  records: HourlyRecord[];
};

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
      parseInt(color1.substring(0, 2), 16) * (1 - ratio)
  );
  const g = Math.ceil(
    parseInt(color2.substring(2, 4), 16) * ratio +
      parseInt(color1.substring(2, 4), 16) * (1 - ratio)
  );
  const b = Math.ceil(
    parseInt(color2.substring(4, 6), 16) * ratio +
      parseInt(color1.substring(4, 6), 16) * (1 - ratio)
  );

  return hex(r) + hex(g) + hex(b);
};

export default function ElPrice() {
  const [prices, setPrices] = useState<Serie[] | null>();
  const [maxPrice, setMaxPrice] = useState<number>(3);
  const [maxPricePerDay, setMaxPricePerDay] = useState({
    today: -1,
    tomorrow: -1,
    yesterday: -1,
  });
  const { priceArea, timezone } = useContext(InitDataContext);

  useEffect(() => {
    const doFetch = () => {
      const spotPricesURL = new URL(
        "https://api.energidataservice.dk/dataset/Elspotprices"
      );
      const params = {
        offset: "0",
        limit: "35",
        filter: JSON.stringify({ PriceArea: [priceArea] }),
        sort: "HourUTC DESC",
      };

      for (const param in params) {
        spotPricesURL.searchParams.set(
          param,
          params[param as keyof typeof params]
        );
      }

      fetch(spotPricesURL)
        .then((res) => res.json())
        .then((data: SpotPrices) => {
          const prices: Serie[] = [
            { id: "Past", data: [] },
            { id: "Future", data: [] },
            { id: "Present", data: [] },
          ];
          const records = data.records.reverse();
          const now = DateTime.now().setZone(timezone);

          for (const recordIndex in records) {
            const record = records[recordIndex];
            const date = DateTime.fromISO(record.HourUTC + "Z").setZone(
              timezone
            );
            const timeMomentIndexToAddRecordTo = [];
            let nowData = undefined;
            if (date >= now) {
              timeMomentIndexToAddRecordTo.push(1);
            } else {
              if (now.hasSame(date, "hour")) {
                // this connects the two lines nicely
                const nowHourPrice = record.SpotPriceEUR / 1000;
                const futureHourPrice =
                  records[parseInt(recordIndex) + 1].SpotPriceEUR / 1000;
                const averageOfThisAndNext = parseFloat(
                  (
                    nowHourPrice +
                    (futureHourPrice - nowHourPrice) * (now.minute / 60)
                  ).toFixed(10)
                );
                const nowDate = new Date();

                nowData = {
                  x: nowDate,
                  y: averageOfThisAndNext,
                };
                (prices[1].data as any).push({
                  x: nowDate,
                  y: averageOfThisAndNext,
                });
              }

              timeMomentIndexToAddRecordTo.push(0);
            }

            for (const index of timeMomentIndexToAddRecordTo) {
              (prices[index].data as any).push({
                x: new Date(record.HourDK),
                y: parseFloat((record.SpotPriceEUR / 1000).toFixed(10)),
              });
            }
            if (nowData) {
              (prices[0].data as any).push(nowData);
            }
          }
          setPrices(prices);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    const intervalId = setInterval(doFetch, 1000 * 60 * 5);

    doFetch();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!prices) {
      return;
    }
    let maxPriceNow = 0;
    const _maxPricePerDay = { today: -1, tomorrow: -1, yesterday: -1 };
    const now = DateTime.now().setZone(timezone);
    const yesterday = now.minus({ days: 1 });
    for (const momentOfTime of prices) {
      for (const price of momentOfTime.data) {
        if (typeof price.y === "number") {
          if (price.y > maxPriceNow) {
            maxPriceNow = price.y;
          }
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
    setMaxPrice(maxPriceNow);
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
      [] as { x: Date; y: number }[]
    );
  }, [prices]);

  if (!prices) {
    return null;
  }

  return (
    <ResponsiveLineCanvas
      data={prices}
      enableCrosshair
      crosshairType="top-left"
      pixelRatio={1}
      margin={{ bottom: 60, left: 80, right: 30, top: 30 }}
      curve="monotoneX"
      enableArea
      theme={{
        axis: {
          legend: {
            text: {
              fontSize: 20,
              fontWeight: "bold",
            },
          },
          ticks: {
            text: {
              fontSize: 15,
              fontWeight: "bold",
            },
          },
        },
      }}
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
        tickValues: allDataPoints?.map((d) => d.x) || [],
        legend: "Hour",
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        legend: "Price in €/KWh",
        legendPosition: "middle",
        legendOffset: -55,
      }}
      pointBorderWidth={4}
      pointBorderColor={(p: { index: number }) => {
        const y = allDataPoints?.[p.index]?.y;
        if (
          typeof y !== "number" ||
          y === null ||
          y === undefined ||
          isNaN(y)
        ) {
          return "#000000";
        }

        return (
          "#" +
          calculateMiddleColor({
            color1: "00FF00",
            color2: "FF0000",
            ratio: y / maxPrice,
          })
        );
      }}
      tooltip={(d) => {
        const pointDay = DateTime.fromJSDate(d.point.data.x as Date).setZone(
          timezone
        );
        const now = DateTime.now().setZone(timezone);
        const yesterday = now.minus({ days: 1 });
        const tomorrow = now.plus({ days: 1 });
        const whenDay: "today" | "yesterday" | "tomorrow" =
          [
            { day: now, t: "today" as const },
            { day: tomorrow, t: "tomorrow" as const },
            { day: yesterday, t: "yesterday" as const },
          ].find((d) => pointDay.toFormat("MMDD") === d.day.toFormat("MMDD"))
            ?.t || "today";

        return `${Math.round(
          ((d.point.data.y as number) / (maxPricePerDay[whenDay] as number)) *
            100
        )}% of max`;
      }}
      yScale={{
        type: "linear",
        max: maxPrice * 1.1,
      }}
      colors={colors}
    />
  );
}
