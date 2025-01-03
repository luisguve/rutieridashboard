import React, { useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Home, Dashboard, HomeTab, RoutesTab, UsersTab } from './routes'
import 'bootstrap/dist/css/bootstrap.min.css';
import Popper from '@popperjs/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';
// import i18n (needs to be bundled ;))
import './i18n';
import ReactGA from 'react-ga';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { STRAPI, ROL_CHOFER, ROL_PASAJERO } from "./lib/constants"
import { AuthContext, AuthProvider, OrganizationProvider } from "./context"

const TRACKING_ID = "G-0MGZQXDPE4";

ReactGA.initialize(TRACKING_ID);

interface AppWrapperProps {
  children: React.ReactNode
}
const AppWrapper = (props: AppWrapperProps) => {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    if (user) {
      // setUser(user)
    }
  }, [user])
  useEffect(() => {
  	ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (<>{props.children}</>)
}

const RequireAuth = ({ children }: AppWrapperProps) => {
  const { user } = useContext(AuthContext)
  const location = useLocation();

  if (user !== null) {
    return (<>{children}</>)
  } else {
    return (<Navigate  to="/" replace state={{ path: location.pathname }} />)
  }
}

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <OrganizationProvider>
        <BrowserRouter>
          <AppWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>}>
                <Route path="" element={<HomeTab />} />
                <Route path="routes" element={<RoutesTab />} />
                <Route path="drivers" element={<UsersTab mode={ROL_CHOFER} />} />
                <Route path="users" element={<UsersTab mode={ROL_PASAJERO} />} />
              </Route>
              <Route
                path="*"
                element={
                  <main style={{ padding: "1rem" }}>
                    <p>There's nothing here!</p>
                  </main>
                }
              />
            </Routes>
          </AppWrapper>
        </BrowserRouter>
      </OrganizationProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
