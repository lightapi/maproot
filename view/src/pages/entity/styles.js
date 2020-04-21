import { makeStyles } from "@material-ui/styles";

export default makeStyles(theme => ({
  card: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
  progressSection: {
    marginBottom: theme.spacing(1),
  },
  progressTitle: {
    marginBottom: theme.spacing(2),
  },
  progress: {
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  fullHeightBody: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  button: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  progressBar: {
    backgroundColor: theme.palette.warning.main,
  },
  legendElementText: {
    marginLeft: theme.spacing(1),
  },
  serverOverviewElement: {
    display: "flex",
    alignItems: "center",
    maxWidth: "100%",
  },
  serverOverviewElementText: {
    minWidth: 145,
    paddingRight: theme.spacing(2),
  },
  serverOverviewElementChartWrapper: {
    width: "100%",
  },
  mainChartBody: {
    overflowX: "auto",
  },
  mainChartHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.only("xs")]: {
      flexWrap: "wrap",
    },
  },
  mainChartHeaderLabels: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.only("xs")]: {
      order: 3,
      width: "100%",
      justifyContent: "center",
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
  },
  mainChartHeaderLabel: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(3),
  },
  mainChartSelectRoot: {
    borderColor: theme.palette.text.hint + "80 !important",
  },
  mainChartSelect: {
    padding: 10,
    paddingRight: 25,
  },
  mainChartLegentElement: {
    fontSize: "18px !important",
    marginLeft: theme.spacing(1),
  },
}));
