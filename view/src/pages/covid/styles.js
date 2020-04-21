import { makeStyles } from "@material-ui/styles";

export default makeStyles(theme => ({
  card: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
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
  clusterMarker: {
    color: "#fff",
    background: "#1978c8",
    borderRadius: "50%",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
}));
