import { useState, useEffect } from 'react'
import './App.css'

import { Spin, Layout, Menu, Button } from 'antd'
// import { initMap } from 'services/map_service'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useLocation,
    Navigate,
    useNavigate,
} from 'react-router-dom'
import Places from 'pages/Places/Places.lazy'
import Profile from 'pages/Profile/Profile.lazy'
import Login from 'pages/Login/Login.lazy'
import { useCurrentUser, logout } from 'services/firebase'

type MenuOption = 'places' | 'pick' | 'friends' | 'profile' | 'logout'
const Header = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const [currentMenuSelection, _] = useState<MenuOption>(
        (location.pathname.split('/')[1] || 'places') as MenuOption,
    )
    return (
        <Layout.Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Menu
                    style={{ flex: 1 }}
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={[currentMenuSelection]}
                    onClick={e => {
                        navigate({ pathname: e.key })
                    }}
                    items={[
                        {
                            key: 'places',
                            label: 'Places',
                        },
                        {
                            key: 'pick',
                            label: 'Do Something Tonight',
                        },
                        {
                            key: 'friends',
                            label: 'Friends',
                        },
                        { key: 'profile', label: 'Profile' },
                    ]}
                ></Menu>
                <Button
                    onClick={() => {
                        logout()
                        window.location.reload()
                    }}
                >
                    Logout
                </Button>
            </div>
        </Layout.Header>
    )
}

const ActualApp = () => {
    const user = useCurrentUser()
    if (user === null) {
        return <Login />
    }

    return (
        <Layout style={{ width: '99vw' }}>
            <Header />
            <Layout.Content>
                <Routes>
                    <Route path="/" element={<Navigate to={{ pathname: 'places' }} />} />
                    <Route path="/places" element={<Places />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Layout.Content>
        </Layout>
    )
}

const App = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 } },
    })
    const [mapLoaded, setMapLoaded] = useState(false)
    useEffect(() => {
        setMapLoaded(!!window._googlePlacesAutoComplete)
    }, [])
    if (mapLoaded) {
        return (
            <Router>
                <QueryClientProvider client={queryClient}>
                    <ActualApp />
                </QueryClientProvider>
            </Router>
        )
    }
    return <Spin />
}

export default App
