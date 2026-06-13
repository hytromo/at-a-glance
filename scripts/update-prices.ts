// Script to be run with bun

import { format as dateFormat, startOfDay, endOfDay, add } from "date-fns";

type SpotPriceRecord = {
  TimeUTC: string;
  TimeDK: string;
  PriceArea: "DK1";
  DayAheadPriceEUR: number; // per MWh
  DayAheadPriceDKK: number; // per MWh
};

type SpotPricesDto = {
  total: number;
  filters: string;
  sort: string;
  limit: number;
  dataset: string;
  records: SpotPriceRecord[];
};

const doFetch = async () => {
  const spotPricesURL = new URL("https://stromligning.dk/api/prices");
  const formatStr = "yyyy-MM-dd'T'HH':'mm";
  const today = dateFormat(startOfDay(new Date()), formatStr);
  const tomorrow = dateFormat(
    endOfDay(add(new Date(), { days: 1 })),
    formatStr,
  );
  const params = {
    productId: "enkel_energi-pioneers",
    supplierId: "cerius_c",
    aggregation: "1h",
    from: today,
    to: tomorrow,
  };

  for (const param in params) {
    spotPricesURL.searchParams.set(param, params[param as keyof typeof params]);
  }
  console.log(spotPricesURL.toString());

  const spotPrices: SpotPricesDto = await (await fetch(spotPricesURL)).json();
  await Bun.write("public/spot-prices.json", JSON.stringify(spotPrices));
};

const main = async () => {
  await doFetch();
};

main();
