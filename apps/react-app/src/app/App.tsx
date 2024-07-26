import { Link, BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "./providers/router/AppRouter";

const App = () => {
  return (
    <Router basename={"/"}>
      <Link to="/">Home</Link>
      <Link to="/charts">Charts</Link>
      <Link to="/sensors">Sensors</Link>
      <AppRouter />
    </Router>
  );
};

export default App;
