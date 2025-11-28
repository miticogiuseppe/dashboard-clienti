const defaultOptions = {
  chart: {
    redrawOnWindowResize: true,
    height: 315,
    type: "bar",
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      enabledOnSeries: undefined,
      top: 7,
      left: 0,
      blur: 1,
      color: ["transparent", "transparent", "rgb(227, 84, 212)"],
      opacity: 0.05,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "18%",
      borderRadius: 2,
    },
  },
  grid: {
    borderColor: "#f1f1f1",
    strokeDashArray: 3,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [0, 2, 2],
    curve: "smooth",
  },
  legend: {
    show: true,
    fontSize: "12px",
    position: "bottom",
    horizontalAlign: "center",
    fontWeight: 500,
    height: 40,
    offsetX: 0,
    offsetY: 10,
    labels: {
      colors: "#9ba5b7",
    },
    markers: {
      width: 7,
      height: 7,
      shape: "circle",
      size: 3.5,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      offsetX: 0,
      offsetY: 0,
    },
  },
  colors: [
    "var(--primary-color)",
    "rgba(119, 119, 142, 0.05)",
    "rgb(227, 84, 212)",
  ],
  yaxis: {
    title: {
      style: {
        color: "#adb5be",
        fontSize: "14px",
        fontFamily: "poppins, sans-serif",
        fontWeight: 600,
        cssClass: "apexcharts-yaxis-label",
      },
    },
    labels: {
      formatter: function (y) {
        return y.toFixed(0) + "";
      },
      show: true,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
  xaxis: {
    type: "category",
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    axisBorder: {
      show: true,
      color: "rgba(119, 119, 142, 0.05)",
      offsetX: 0,
      offsetY: 0,
    },
    axisTicks: {
      show: true,
      borderType: "solid",
      color: "rgba(119, 119, 142, 0.05)",
      width: 6,
      offsetX: 0,
      offsetY: 0,
    },
    labels: {
      rotate: -90,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y) {
        if (typeof y !== "undefined") {
          return y.toFixed(0);
        }
        return y;
      },
    },
  },
  fill: {
    colors: undefined,
    opacity: 0.025,
    type: ["solid", "solid"],
    gradient: {
      shade: "light",
      type: "horizontal",
      shadeIntensity: 0.5,
      gradientToColors: ["#fdc530"],
      inverseColors: true,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 50, 100],
      colorStops: ["#fdc530"],
    },
  },
};

const createSeries = (countArray) => {
  return [
    {
      name: "Counters",
      type: "column",
      data: _.map(countArray, "count"),
    },
  ];
};
const createOptions = (
  countArray,
  keyCol,
  formatFunc = undefined,
  chartType = "bar",
  fillColor = "var(--primary-color)"
) => {
  let options = _.cloneDeep(defaultOptions);
  options.chart = {
    ...options.chart,
    type: chartType,
  };
  options.xaxis.categories = _.map(countArray, (o) =>
    o[keyCol] ? (formatFunc ? formatFunc(o[keyCol]) : o[keyCol]) : ""
  );
  options.colors[0] = fillColor;
  return options;
};

export { createSeries, createOptions };
