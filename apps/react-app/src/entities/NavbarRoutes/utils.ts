type TColor =
  | "foreground"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export const getRouteColor = (pathname: string, url: string): TColor => {
  return pathname === url ? "primary" : "foreground";
};

export const DEFAULT_NAVBAR_ROUTES_LIST = [
  { url: "/", name: "Acquisition" },
  { url: "/sensors", name: "Sensors" },
  { url: "/charts", name: "Charts" },
  { url: "/power", name: "Power" },
];
