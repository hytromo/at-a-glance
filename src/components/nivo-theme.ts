export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export const getTheme = (theme: "dark" | "light") => {
  const defaults = {
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
  };

  const perTheme = {
    dark: {
      background: "#000000",
      textColor: "#d6dbdc ",
      axis: {
        legend: {
          text: {
            fill: "#a0aec0",
          },
        },
        ticks: {
          text: {
            fill: "#a0aec0",
          },
        },
      },
      grid: {
        line: {
          stroke: "#2d3748",
        },
      },
      crosshair: {
        line: {
          stroke: "#a0aec0",
        },
      },
    },
    light: {
      background: "#f7fafc",
      textColor: "#1a202c",
      axis: {
        legend: {
          text: {
            fill: "#718096",
          },
        },
        ticks: {
          text: {
            fill: "#718096",
          },
        },
      },
      grid: {
        line: {
          stroke: "#cbd5e0",
        },
      },
      crosshair: {
        line: {
          stroke: "#718096",
        },
      },
    },
  };

  return mergeDeep(defaults, perTheme[theme]);
};
