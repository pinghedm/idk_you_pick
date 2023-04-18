import { useState, useEffect } from "react";
import "./App.css";
import { Spin } from "antd";
import { initMap } from "services/map_service";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
function ActualApp() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Hello</div>} />
      </Routes>
    </div>
  );
}

const App = () => {
  const queryClient = new QueryClient();
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    async function _init() {
      await initMap();
      setMapLoaded(true);
    }
    _init();
  }, []);
  if (mapLoaded) {
    return (
      <Router>
        <QueryClientProvider client={queryClient}>
          <ActualApp />
        </QueryClientProvider>
      </Router>
    );
  }
  return <Spin />;
};

export default App;
