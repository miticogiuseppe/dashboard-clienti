const defaultOptions = {
  chart: {
    height: 404,
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      enabledOnSeries: undefined,
      top: 10,
      left: 0,
      blur: 1,
      color: "rgba(0, 0, 0, 0.1)",
      opacity: 0.3,
    },
  },
  grid: {
    show: true,
    borderColor: "rgba(119, 119, 142, 0.1)",
    strokeDashArray: 4,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [1.5, 1.5, 1],
    curve: ["smooth", "straight"],
    dashArray: [4, 4, 0],
  },
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "center",
    fontWeight: 600,
    fontSize: "11px",
    tooltipHoverFormatter: function (val, opts) {
      return (
        val +
        " - " +
        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
        ""
      );
    },
    labels: {
      colors: "#74767c",
    },
    markers: {
      width: 8,
      height: 8,
      size: 4,
      strokeWidth: 0,
      radius: 12,
      offsetX: 0,
      offsetY: 0,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      borderRadiusApplication: "all",
      borderRadiusWhenStacked: "last",
      columnWidth: "15%",
    },
  },
  fill: {
    type: ["soild", "soild", "soild"],
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 1,
    },
  },
  colors: [
    "rgba(227, 84, 212, 1)",
    "rgba(255, 93, 159, 0.06)",
    "var(--primary-color)",
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
      "Aug",
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
};

const createSeries = (countArray, name = "Counters") => {
  return [
    {
      name: name,
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
