import { useState, useEffect } from "react";
import "./App.css";

import { Spin, Layout, Menu } from "antd";
import { initMap } from "services/map_service";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import Places from "pages/Places/Places.lazy";

type MenuOption = "places" | "pick" | "friends" | "logout";
const Header = () => {
  const location = useLocation();

  const [currentMenuSelection, setCurrentMenuSelection] = useState<MenuOption>(
    (location.pathname.split("/")[1] || "places") as MenuOption
  );
  return (
    <Layout.Header>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[currentMenuSelection]}
        onClick={(e) => {
          setCurrentMenuSelection(e.key as MenuOption);
        }}
      >
        <Menu.Item key="places">
          <Link to="places">Places</Link>
        </Menu.Item>
        <Menu.Item key="pick">
          <Link to="pick">Do Something Tonight</Link>
        </Menu.Item>
        <Menu.Item key="friends">
          <Link to="friends">Friends</Link>
        </Menu.Item>
        <Menu.Item
          key="logout"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            console.log("logout");
          }}
        >
          Logout
        </Menu.Item>
      </Menu>
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
