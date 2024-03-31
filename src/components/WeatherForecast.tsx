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
        <div className="flex space-x-2 items-center">
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
              style={{ padding: "1rem", maxHeight: "40vh", width: "8rem" }}
            >
              <div>{day.date.setZone(timezone).toFormat("EEE d MMM")}</div>
              <img
                width="50px"
                style={{ clipPath: "circle(30%)" }}
                src={wmoToDescription[day.weather_code].day.image}
              />
              <div style={{ marginBottom: ".75rem" }}>
                {wmoToDescription[day.weather_code].day.description}
              </div>

              <div className="text-slate-400" style={{ marginBottom: ".5rem" }}>
                {Math.round(day.temperature.min)} -{" "}
                {Math.round(day.temperature.max)}°C
              </div>
              <div className="text-slate-400 text-xs flex flex-col items-center">
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
