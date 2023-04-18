import { useState, useEffect } from "react";
import "./App.css";

import { Spin, Layout, Menu, Button } from "antd";
import { initMap } from "services/map_service";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Places from "pages/Places/Places.lazy";

type MenuOption = "places" | "pick" | "friends" | "logout";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentMenuSelection, _] = useState<MenuOption>(
    (location.pathname.split("/")[1] || "places") as MenuOption
  );
  return (
    <Layout.Header>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Menu
          style={{ flex: 1 }}
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[currentMenuSelection]}
          onClick={(e) => {
            navigate({ pathname: e.key });
          }}
          items={[
            {
              key: "places",
              label: "Places",
            },
            {
              key: "pick",
              label: "Do Something Tonight",
            },
            {
              key: "friends",
              label: "Friends",
            },
          ]}
        ></Menu>
        <Button
          onClick={() => {
            console.log("logout");
          }}
        >
          Logout
        </Button>
      </div>
    </Layout.Header>
  );
};

const ActualApp = () => {
  return (
    <Layout
      className="layout"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Header />
      <Layout.Content style={{ padding: "25px" }}>
        <Routes>
          <Route path="/" element={<Navigate to={{ pathname: "places" }} />} />
          <Route path="/places" element={<Places />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 } },
  });
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
