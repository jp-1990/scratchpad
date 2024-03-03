"use client";

import React from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "../../node_modules/react-grid-layout/css/styles.css";
import "../../node_modules/react-resizable/css/styles.css";

import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { ChartsReferenceLine, LineChart, BarChart } from "@mui/x-charts";
import { LinePlot, MarkPlot } from "@mui/x-charts/LineChart";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { teal } from "@mui/material/colors";

function DemoBarChart() {
  return (
    <BarChart
      xAxis={[
        {
          id: "barCategories",
          data: ["bar A", "bar B", "bar C"],
          scaleType: "band",
        },
      ]}
      series={[
        {
          data: [2, 5, 3],
        },
      ]}
      height={280}
    />
  );
}

function DemoLineChart() {
  return (
    <LineChart
      xAxis={[{ data: [1, 2, 3, 4, 5, 6] }]}
      series={[
        {
          curve: "linear",
          data: [0, 5, 2, 6, 3, 9.3],
          showMark: ({ index }) => index % 2 === 0,
        },
        {
          curve: "linear",
          data: [6, 3, 7, 9.5, 4, 2],
          showMark: ({ index }) => index % 2 === 0,
        },
      ]}
      height={280}
    />
  );
}

function DemoLineChartWithReferenceLines() {
  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    "Page A",
    "Page B",
    "Page C",
    "Page D",
    "Page E",
    "Page F",
    "Page G",
  ];
  return (
    <ChartContainer
      height={280}
      width={350}
      sx={{ paddingLeft: "12px" }}
      series={[
        { data: pData, label: "pv", type: "line", curve: "linear" },
        { data: uData, label: "uv", type: "line" },
      ]}
      xAxis={[{ scaleType: "point", data: xLabels }]}
    >
      <LinePlot />
      <MarkPlot />
      <ChartsReferenceLine
        y={pData.reduce((p, c) => p + c, 0) / pData.length}
        label={`Avg ${(pData.reduce((p, c) => p + c, 0) / pData.length).toFixed(2)}`}
        lineStyle={{ stroke: "red" }}
      />
      <ChartsXAxis />
      <ChartsYAxis />
    </ChartContainer>
  );
}

function Clicks({ hideDate }: { hideDate?: boolean }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold font-mono text-sky-300">
          {(Math.random() * 1000).toFixed(0)}
        </h2>
        <span className="text-sky-500">Clicks</span>
      </div>
      <div className="flex flex-1" />
      {!hideDate && (
        <span className="text-sm mb-2 text-slate-300">02/02/24 - 02/03/24</span>
      )}
    </>
  );
}

function Rejections({ hideDate }: { hideDate?: boolean }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold font-mono text-red-300">
          {(Math.random() * 1000).toFixed(0)}
        </h2>
        <span className="text-red-500">Rejected</span>
      </div>
      <div className="flex flex-1" />
      {!hideDate && (
        <span className="text-sm mb-2 text-slate-300">02/02/24 - 02/03/24</span>
      )}
    </>
  );
}

function Conversions({ hideDate }: { hideDate?: boolean }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold font-mono text-teal-300">
          {(Math.random() * 1000).toFixed(0)}
        </h2>
        <span className="text-teal-500">Conversions</span>
      </div>
      <div className="flex flex-1" />
      {!hideDate && (
        <span className="text-sm mb-2 text-slate-300">02/02/24 - 02/03/24</span>
      )}
    </>
  );
}

function Grouping() {
  return (
    <article className="flex w-full h-full items-center p-2">
      <div className="border border-slate-800 h-full px-4 flex items-center">
        <Clicks hideDate />
      </div>
      <div className="ml-2 border border-slate-800 h-full px-4 flex items-center">
        <Conversions hideDate />
      </div>
      <div className="ml-2 border border-slate-800 h-full px-4 flex items-center">
        <Rejections hideDate />
      </div>
      <div className="ml-2 border border-slate-800 h-full px-4 flex items-center">
        <Clicks hideDate />
      </div>
      <div className="ml-2 border border-slate-800 h-full px-4 flex items-center">
        <Conversions hideDate />
      </div>
      <div className="ml-2 border border-slate-800 h-full px-4 flex items-center">
        <Rejections hideDate />
      </div>
    </article>
  );
}

const contentMap = {
  small: [<Clicks key={0} />, <Conversions key={1} />, <Rejections key={2} />],
  large: [
    <DemoLineChart key={0} />,
    <DemoBarChart key={1} />,
    <DemoLineChartWithReferenceLines key={2} />,
  ],
  long: [<Grouping key={0} />],
};

const titleMap = ["Overtime Report", "Advertiser Report", "Conversion Report"];

const ResponsiveGridLayout = WidthProvider(Responsive);

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 8, md: 4, sm: 4, xs: 4, xxs: 2 };

function findBreakpoint(width: number) {
  let bp = "xxs";
  for (const key of Object.keys(breakpoints).reverse()) {
    if (width > breakpoints[key as keyof typeof breakpoints]) bp = key;
  }

  return bp as keyof typeof breakpoints;
}

function findNumberOfCols(breakpoint: keyof typeof breakpoints) {
  return cols[breakpoint];
}

const useWindowSize = () => {
  const [size, setSize] = React.useState([0, 0]);
  React.useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

type WidgetProps = {
  bg: string;
  onRemove: (e: any, id: any) => void;
} & any;
const WidgetWithRef = React.forwardRef(function Widget(
  {
    style,
    className,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    id,
    onRemove,
    bg,
    size,
    title,
    content,
  }: WidgetProps,
  ref: any,
) {
  const [view, setView] = React.useState<"data" | "filters">("data");
  const [f1, setF1] = React.useState("");
  const [f2, setF2] = React.useState("");
  const [applied, setApplied] = React.useState(false);

  const handleChange1 = (event: SelectChangeEvent) => {
    setF1(event.target.value as string);
  };
  const handleChange2 = (event: SelectChangeEvent) => {
    setF2(event.target.value as string);
  };

  const applyFilters = (e) => {
    e.stopPropagation();
    setView("data");
    setApplied(true);
  };
  const cancelFilters = (e) => {
    e.stopPropagation();
    setView("data");
  };

  if (size === "small") {
    return (
      <div
        style={{ ...style }}
        className={className}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        ref={ref}
      >
        <div className="p-1 h-full">
          <article className={`bg-slate-900 h-full flex flex-col`}>
            <header className="flex flex-row justify-between items-center p-3 cursor-move">
              <div />
              <div
                id="card-actions"
                className="border-slate-800 py-1 px-2 rounded-sm on-remove-button"
              >
                <button
                  className="mr-2 text-lg font-mono"
                  onClick={(_e) => null}
                >
                  <PushPinIcon fontSize="small" />
                </button>
                <button
                  className="text-lg font-mono"
                  onClick={(e) => onRemove(e, id)}
                >
                  <DeleteIcon fontSize="medium" />
                </button>
              </div>
            </header>
            <section className="flex flex-col justify-center items-center h-full">
              {content}
            </section>
          </article>
        </div>
      </div>
    );
  }

  if (size === "large") {
    return (
      <div
        style={{ ...style }}
        className={className}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        ref={ref}
      >
        <div className="p-1 h-full">
          <article className={`bg-slate-900 h-full flex flex-col`}>
            <header className="flex flex-row justify-between items-center p-3 cursor-move border-b border-b-slate-800">
              <h2 className="text-2xl">{title}</h2>
              <div
                id="card-actions"
                className="border-slate-800 py-1 px-2 rounded-sm on-remove-button"
              >
                <button
                  className="mr-2 text-lg font-mono"
                  onClick={(_e) => {
                    setView("filters");
                    setApplied(false);
                  }}
                >
                  <FilterAltIcon
                    fontSize="medium"
                    sx={{
                      color: (f1 || f2) && applied ? teal[500] : "inherit",
                    }}
                  />
                </button>
                <button
                  className="mr-2 text-lg font-mono"
                  onClick={(_e) => null}
                >
                  <PushPinIcon fontSize="small" />
                </button>
                <button
                  className="text-lg font-mono"
                  onClick={(e) => onRemove(e, id)}
                >
                  <DeleteIcon fontSize="medium" />
                </button>
              </div>
            </header>
            {view === "data" && (
              <section id="data" className="flex on-remove-button">
                {content}
              </section>
            )}
            {view === "filters" && (
              <section
                id="filters"
                className="flex on-remove-button px-2 pb-2 flex-col h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="mb-2 ml-1">Select filters:</header>
                <div className="w-full on-remove-button">
                  <FormControl fullWidth sx={{ marginBottom: "12px" }}>
                    <InputLabel id="demo-simple-select-label">
                      Campaign
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={f1}
                      label="Campaign"
                      onChange={handleChange1}
                    >
                      <MenuItem value={10}>X</MenuItem>
                      <MenuItem value={20}>Y</MenuItem>
                      <MenuItem value={30}>Z</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Metrics
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={f2}
                      label="Metrics"
                      onChange={handleChange2}
                    >
                      <MenuItem value={10}>A</MenuItem>
                      <MenuItem value={20}>B</MenuItem>
                      <MenuItem value={30}>C</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-1" />
                <footer className="flex w-full justify-end">
                  <button
                    className="border border-teal-500 rounded-sm px-4 py-2 mr-2"
                    onClick={cancelFilters}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-teal-500 px-4 py-2 rounded-sm text-white"
                    onClick={applyFilters}
                  >
                    Apply
                  </button>
                </footer>
              </section>
            )}
          </article>
        </div>
      </div>
    );
  }

  if (size === "long") {
    return (
      <div
        style={{ ...style }}
        className={className}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        ref={ref}
      >
        <div className="p-1 h-full">
          <article className={`bg-slate-900 h-full flex flex-col`}>
            <header className="flex flex-row justify-between items-center p-3 pb-0 cursor-move">
              <span className="flex items-end">
                <h2 className="text-xl mr-4">Metric Group</h2>
                <span className="text-sm text-slate-300">
                  [02/02/24 - 03/03/24]
                </span>
              </span>
              <div
                id="card-actions"
                className="border-slate-800 py-1 px-2 rounded-sm on-remove-button"
              >
                <button
                  className="mr-2 text-lg font-mono"
                  onClick={(_e) => {
                    setView("filters");
                    setApplied(false);
                  }}
                >
                  <FilterAltIcon
                    fontSize="medium"
                    sx={{
                      color: (f1 || f2) && applied ? teal[500] : "inherit",
                    }}
                  />
                </button>
                <button
                  className="mr-2 text-lg font-mono"
                  onClick={(_e) => null}
                >
                  <PushPinIcon fontSize="small" />
                </button>
                <button
                  className="text-lg font-mono"
                  onClick={(e) => onRemove(e, id)}
                >
                  <DeleteIcon fontSize="medium" />
                </button>
              </div>
            </header>
            {view === "data" && (
              <section id="data" className="flex on-remove-button h-full">
                {content}
              </section>
            )}
            {view === "filters" && (
              <section
                id="filters"
                className="flex on-remove-button px-2 pb-2 flex-col h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="mb-2 ml-1">Select filters:</header>
                <div className="w-full on-remove-button flex ">
                  <FormControl fullWidth sx={{ marginRight: "12px" }}>
                    <InputLabel id="demo-simple-select-label">
                      Campaign
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={f1}
                      label="Campaign"
                      onChange={handleChange1}
                    >
                      <MenuItem value={10}>X</MenuItem>
                      <MenuItem value={20}>Y</MenuItem>
                      <MenuItem value={30}>Z</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Metrics
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={f2}
                      label="Metrics"
                      onChange={handleChange2}
                    >
                      <MenuItem value={10}>A</MenuItem>
                      <MenuItem value={20}>B</MenuItem>
                      <MenuItem value={30}>C</MenuItem>
                    </Select>
                  </FormControl>
                  <footer className="flex justify-end flex-col ml-2">
                    <button
                      className="border border-teal-500 rounded-sm px-2 py-1 mb-1"
                      onClick={cancelFilters}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-teal-500 px-2 py-1 rounded-sm text-white"
                      onClick={applyFilters}
                    >
                      Apply
                    </button>
                  </footer>
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    );
  }
});

export default function WidgetPage() {
  const [innerWidth, _innerHeight] = useWindowSize();

  React.useLayoutEffect(() => {
    if (!innerWidth) return;
    const breakpoint = findBreakpoint(innerWidth);
    const nCols = findNumberOfCols(breakpoint);

    numCols.current = nCols;
    setRowH(innerWidth / nCols);
  }, [innerWidth]);

  const [rowH, setRowH] = React.useState(180);
  const [widgets, setWidgets] = React.useState({
    "0": {
      key: "0",
      size: "large",
      bg: "bg-red-500",
      content: <DemoLineChart />,
      title: titleMap[0],
      "data-grid": { i: "0", w: 2, h: 2, x: 0, y: 0 },
    },
    "1": {
      key: "1",
      size: "large",
      bg: "bg-blue-500",
      content: <DemoBarChart />,
      title: titleMap[1],
      "data-grid": { i: "1", w: 2, h: 2, x: 2, y: 0 },
    },
  });

  const layout = React.useRef<Layout[]>([]);
  const maxY = React.useRef<number>(2);
  const numCols = React.useRef<number>(4);

  function addWidget(size: string) {
    setWidgets((prev) => {
      // build grid to check free areas
      const matrix: number[][] = [];
      for (let i = 0; i <= maxY.current + 4; i++) {
        const row: number[] = [];
        for (let j = 0; j < numCols.current; j++) {
          row.push(0);
        }
        matrix.push(row);
      }

      // populate grid with taken cells
      for (const l of layout.current) {
        const size = prev[l.i as keyof typeof widgets].size;

        matrix[l.y][l.x] = 1;
        switch (size) {
          case "small":
            if (l.y > maxY.current) maxY.current = l.y;
            continue;

          case "large":
            matrix[l.y][l.x + 1] = 1;
            matrix[l.y + 1][l.x] = 1;
            matrix[l.y + 1][l.x + 1] = 1;
            if (l.y + 1 > maxY.current) maxY.current = l.y;
            continue;

          case "long":
            matrix[l.y][l.x + 1] = 1;
            matrix[l.y][l.x + 2] = 1;
            matrix[l.y][l.x + 3] = 1;
            if (l.y > maxY.current) maxY.current = l.y;
            continue;
        }
      }

      for (const l of layout.current) {
        prev[l.i as keyof typeof widgets]["data-grid"] = l;
      }

      // find first available location based on size
      let firstGap = [0, 0];
      outer: for (let i = 0; i <= maxY.current + 4; i++) {
        if (firstGap[0] || firstGap[1]) break;
        for (let j = 0; j < numCols.current; j++) {
          // skip row
          if (j === 0 && size === "long" && matrix[i][j] === 1) continue;

          if (matrix[i][j] === 0) {
            switch (size) {
              case "small":
                firstGap = [i, j];
                break outer;

              case "large": {
                const willFit =
                  matrix[i + 1]?.[j] === 0 &&
                  matrix[i]?.[j + 1] === 0 &&
                  matrix[i + 1]?.[j + 1] === 0;
                if (willFit) {
                  firstGap = [i, j];
                  break outer;
                }
              }

              case "long": {
                const willFit =
                  matrix[i]?.[j + 1] === 0 &&
                  matrix[i]?.[j + 2] === 0 &&
                  matrix[i]?.[j + 3] === 0;
                if (willFit) {
                  firstGap = [i, j];
                  break outer;
                }
              }
            }
          }
        }
      }

      console.log("matrix", matrix);
      console.log("firstgap", firstGap);

      const bg = [
        "bg-purple-500",
        "bg-green-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-teal-500",
        "bg-blue-500",
      ];

      const elId = Math.floor(
        Math.random() * contentMap[size as keyof typeof contentMap].length,
      );
      const content = contentMap[size as keyof typeof contentMap][elId];
      const title = titleMap[Math.floor(Math.random() * titleMap.length)];

      const id = crypto.randomUUID();
      const [width, height] =
        size === "large" ? [2, 2] : size === "small" ? [1, 1] : [4, 1];
      const w = {
        key: id,
        size: size,
        bg: bg[Math.floor(Math.random() * bg.length)],
        "data-grid": {
          i: id,
          x: firstGap[1],
          y: firstGap[0],
          w: width,
          h: height,
        },
        content,
        title,
      };

      return { ...prev, [id]: w };
    });
  }

  function onRemove(e: any, id: any) {
    e.stopPropagation();
    setWidgets((prev) => {
      const newState = { ...prev };
      delete newState[id as keyof typeof widgets];

      return newState;
    });
  }

  function onLayoutChange(l: Layout[]) {
    layout.current = l;
    console.log("LAYOUT_CHANGE:", layout);
  }

  return (
    <div className="relative select-none">
      <ResponsiveGridLayout
        className="layout"
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowH}
        margin={[0, 0]}
        isResizable={false}
        onLayoutChange={onLayoutChange}
        draggableCancel=".on-remove-button"
      >
        {Object.keys(widgets).map((k) => {
          const w = widgets[k as keyof typeof widgets];
          const { key, ...rest } = w;
          return (
            <WidgetWithRef key={key} id={key} onRemove={onRemove} {...rest} />
          );
        })}
      </ResponsiveGridLayout>

      <div className="fixed bottom-6 right-6 font-mono flex flex-col">
        <button
          className="px-3 py-1 my-1 rounded-sm bg-gray-50 text-gray-900 text-xl"
          onClick={() => addWidget("small")}
        >
          ADD 1x1
        </button>
        <button
          className="px-3 py-1 my-1 rounded-sm bg-gray-50 text-gray-900 text-xl"
          onClick={() => addWidget("large")}
        >
          ADD 2x2
        </button>
        {innerWidth > breakpoints.xs && (
          <button
            className="px-3 py-1 my-1 rounded-sm bg-gray-50 text-gray-900 text-xl"
            onClick={() => addWidget("long")}
          >
            ADD 4x1
          </button>
        )}
      </div>
    </div>
  );
}
