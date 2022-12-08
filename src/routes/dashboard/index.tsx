import { useState, useContext, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom";

import { AuthContext, OrganizationContext } from "../../context"
import { useDriversRequests, useUsersRequests } from "../../hooks/users"
import { STRAPI } from "../../lib/constants"

const url = `${STRAPI}/api/organizations`

export const Dashboard = () => {
  const { user, logoutUser } = useContext(AuthContext)
  const { setOrgs } = useContext(OrganizationContext)

  if (user === null) {
    return null;
  }

  useEffect(() => {
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${user.token}`
      }
    })
    .then(data => data.json())
    .then(setOrgs)
    .catch(console.log)
  }, [])

  const driversRequests = useDriversRequests()
  const usersRequests = useUsersRequests()

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2 d-flex flex-column flex-shrink-0 p-3 bg-light vh-100 sticky-top">
          <h3 className="text-center">Dashboard</h3>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <NavLink end to="/dashboard" className="nav-link">Home</NavLink>
            </li>
            <li>
              <NavLink end to="/dashboard/routes" className="nav-link">Routes</NavLink>
            </li>
            <li>
              <NavLink end to="/dashboard/drivers" className="nav-link">
                Drivers
                {
                  (driversRequests.length > 0) && (
                    <span className="notification">{ driversRequests.length }</span>
                  )
                }
              </NavLink>
            </li>
            <li>
              <NavLink end to="/dashboard/users" className="nav-link">
                Users
                {
                  (usersRequests.length > 0) && (
                    <span className="notification">{ usersRequests.length }</span>
                  )
                }
              </NavLink>
            </li>
          </ul>
          <hr />
          <div className="dropdown">
            <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
              <strong>{user.username}</strong>
            </a>
            <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
              <li>
                <button className="dropdown-item btn btn-light" onClick={logoutUser}>Sign out</button>
              </li>
            </ul>
          </div>
        </div>
        <main className="col-9 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
