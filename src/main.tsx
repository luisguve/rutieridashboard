import React, { useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Home, Dashboard, HomeTab, RoutesTab, DriversTab, UsersTab } from './routes'
import 'bootstrap/dist/css/bootstrap.min.css';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { STRAPI, ROL_CHOFER, ROL_PASAJERO } from "./lib/constants"
import { AuthContext, AuthProvider, OrganizationProvider } from "./context"

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
                <Route path="drivers" element={<DriversTab mode={ROL_CHOFER} />} />
                <Route path="users" element={<DriversTab mode={ROL_PASAJERO} />} />
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
