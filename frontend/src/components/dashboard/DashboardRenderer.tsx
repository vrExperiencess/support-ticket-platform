// src/components/dashboard/DashboardRenderer.tsx

import type {
  DashboardWidget,
} from "../../features/dashboard/dashboard.types";

import {
  widgetRegistry,
} from "../../features/dashboard/widgetRegistry";

interface DashboardRendererProps {
  widgets:
    DashboardWidget[];
}

export default function DashboardRenderer({
  widgets,
}: DashboardRendererProps) {
  const sortedWidgets =
    [...widgets].sort(
      (
        first:
          DashboardWidget,
        second:
          DashboardWidget,
      ) =>
        first.sortOrder -
        second.sortOrder,
    );

  return (
    <div className="space-y-6">
      {sortedWidgets.map(
        (
          widget:
            DashboardWidget,
        ) => {
          const WidgetComponent =
            widgetRegistry[
              widget.key
            ];

          /**
           * Un widget desconocido no rompe el dashboard.
           */
          if (
            !WidgetComponent
          ) {
            return null;
          }

          return (
            <WidgetComponent
              key={
                widget.key
              }
              widget={
                widget
              }
            />
          );
        },
      )}
    </div>
  );
}