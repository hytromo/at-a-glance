import Image from "next/image";
import { useContext } from "react";
import { InitDataContext } from "../app/data/init-data-context";
import { WeatherContext, weatherContextDefaultValue } from "./WeatherCombo";
import SunriseImage from "./sunrise.svg";
import { wmoToDescription } from "./wmo_map";

export default function WeatherForecast() {
  const { timezone } = useContext(InitDataContext);

  return (
    <WeatherContext.Consumer>
      {({ forecast: days, setWeatherContext, selectedDay }) => (
        <div
          className="flex space-x-2 items-center"
          style={{ margin: "0 1rem" }}
        >
          {days.map((day, i) => (
            <div
              key={i}
              onClick={() => {
                setWeatherContext((prev) =>
                  !prev
                    ? weatherContextDefaultValue
                    : {
                        ...prev,
                        selectedDay: day.date,
                      }
                );
              }}
              className={`transition ease-in-out bg-white dark:bg-slate-800 cursor-pointer flex-1 flex flex-col items-center max-w-sm rounded overflow-hidden ${
                day.date.hasSame(selectedDay, "day")
                  ? "shadow-2xl scale-110"
                  : "shadow-lg hover:scale-105"
              }`}
              style={{ padding: "1rem", height: "275px", width: "150px" }}
            >
              <div style={{ marginBottom: "1rem" }}>
                {day.date.setZone(timezone).toFormat("EEE d MMM")}
              </div>
              <img
                width="80px"
                src={wmoToDescription[day.weather_code].day.image}
              />
              <div style={{ marginBottom: ".75rem" }}>
                {wmoToDescription[day.weather_code].day.description}
              </div>

              <div className="text-gray-500" style={{ marginBottom: "1.5rem" }}>
                {Math.round(day.temperature.min)} -{" "}
                {Math.round(day.temperature.max)}°C
              </div>
              <div className="text-gray-500 text-xs flex flex-col items-center">
                <Image
                  style={{ display: "inline-block" }}
                  width={25}
                  alt="sunrise"
                  priority
                  src={SunriseImage}
                />
                <p>
                  {day.sunrise.setZone(timezone).toFormat("HH:mm")} -{" "}
                  {day.sunset.setZone(timezone).toFormat("HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </WeatherContext.Consumer>
  );
}
