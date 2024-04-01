import dynamic from "next/dynamic";
import { useContext } from "react";
import { ThemeContext } from "../app/theme-context";

const ToggleTheme = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      style={{ position: "absolute", top: "1rem", right: "1rem" }}
      className="rounded-full"
      aria-label="toggle theme"
      onClick={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill={theme === "dark" ? "white" : "black"}
          d="M24 9h-2v-5h-7v-2h9v7zm-9 13v-2h7v-5h2v7h-9zm-15-7h2v5h7v2h-9v-7zm9-13v2h-7v5h-2v-7h9z"
        />
      </svg>
    </button>
  );
};

export default dynamic(() => Promise.resolve(ToggleTheme), {
  ssr: false,
});
