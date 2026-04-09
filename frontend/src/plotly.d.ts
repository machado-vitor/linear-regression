declare module 'plotly.js-dist-min' {
  const Plotly: object;
  export default Plotly;
}

declare module 'react-plotly.js/factory' {
  import { Component } from 'react';

  interface PlotParams {
    data: Record<string, unknown>[];
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    className?: string;
  }

  export default function createPlotlyComponent(
    plotly: object
  ): new () => Component<PlotParams>;
}
