"use client";

import dynamic from "next/dynamic";
import ElPrice from "../../components/ElPrice";
import WeatherCombo from "../../components/WeatherCombo";
import { InitDataContext, initDataDefaultValue } from "./init-data-context";

function Data() {
  const searchParams = new URLSearchParams(document?.location?.search);

  return (
    <InitDataContext.Provider
      value={{
        timezone: searchParams.get("timezone") || initDataDefaultValue.timezone,
        latitude: parseFloat(
          searchParams.get("latitude") ||
            initDataDefaultValue.latitude.toString()
        ),
        longitude: parseFloat(
          searchParams.get("longitude") ||
            initDataDefaultValue.longitude.toString()
        ),
        priceArea:
          searchParams.get("priceArea") || initDataDefaultValue.priceArea,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div style={{ height: "50vh" }}>
          <ElPrice />
        </div>
        <WeatherCombo />
      </div>
    </InitDataContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(Data), {
  ssr: false,
});
