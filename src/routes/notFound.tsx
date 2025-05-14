
import { RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";

export const notFoundRoute: RouteObject = {
  path: "*",
  element: <NotFound />
};
