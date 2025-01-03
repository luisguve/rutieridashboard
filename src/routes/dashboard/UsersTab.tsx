import { useContext, useState } from "react"
import { useTranslation } from "react-i18next"

import { OrganizationContext, AuthContext, IUser } from "../../context"
import { useDrivers, useUsers, useDriversRequests, useUsersRequests } from "../../hooks/users"
import { STRAPI, ROL_CHOFER, ROL_PASAJERO } from "../../lib/constants"


interface DriversTabProps {
  mode: typeof ROL_CHOFER | typeof ROL_PASAJERO
}

const UsersTab = (props: DriversTabProps) => {

  const { organizations, update, updateDriver } = useContext(OrganizationContext)
  const { user } = useContext(AuthContext)
  const { t } = useTranslation("users")

  const DEFAULT_SELECT_VALUE = {
    id: -1,
    nombre: t("drivers.details.select")
  }

  const { mode } = props

  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(() => {
    return DEFAULT_SELECT_VALUE.id.toString()
  })

  const drivers = useDrivers()
  const users = useUsers()
  const driversRequests = useDriversRequests()
  const usersRequests = useUsersRequests()

  if (!user) {
    return null
  }

  if (!organizations.length) {
    return (
      <>
        <h4>{mode === ROL_CHOFER ? t("drivers.heading") : t("users.heading")}</h4>
        <hr />
        <h5>{mode === ROL_CHOFER ? t("drivers.no_org") : t("users.no_org")}</h5>
      </>
    )
  }
  const organization = organizations[0]

  const processRequest = async (userId: number, accepted: boolean) => {

    const url = `${STRAPI}/api/organizations/${organization.code}/process_join_request`
    setLoading(true)
    setErrorMsg("")
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          accepted
        })
      })
      const data = await result.json()

      if (!result.ok) {
        throw data
      }

      update(data)
    } catch(response: any) {
      let msg = "Unexpected error"
      if (response.error && response.error.message) {
        msg = response.error.message
      }
      console.log("Could not process request", response)
      setErrorMsg("Could not process request: " + msg)
    } finally {
      setLoading(false)
    }

  }
  const handleChangeSelectedRoute = (e: React.FormEvent<HTMLSelectElement>) => {
    setSelectedRoute(e.currentTarget.value)
  }

  const setRoute = async (targetUser: IUser) => {
    setLoading(true)
    setErrorMsg("")
    const url = `${STRAPI}/api/organizations/${organization.code}/set_route`
    let routeId: number | null = Number(selectedRoute)
    if (selectedRoute === "-1") {
      routeId = null
    }
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          userId: targetUser.id,
          routeId
        })
      })
      const data = await result.json()

      if (!result.ok) {
        throw data
      }

      updateDriver({
        ...targetUser,
        ruta: data.ruta
      })
    } catch(response: any) {
      let msg = "Unexpected error"
      if (response.error && response.error.message) {
        msg = response.error.message
      }
      console.log("Could not set route", response)
      setErrorMsg("Could not set route: " + msg)
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (targetUser: IUser) => {
    setLoading(true)
    setErrorMsg("")
    const url = `${STRAPI}/api/organizations/${organization.code}/remove_user`
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          userId: targetUser.id
        })
      })
      const data = await result.json()

      if (!result.ok) {
        throw data
      }

      update(data)
    } catch(response: any) {
      let msg = "Unexpected error"
      if (response.error && response.error.message) {
        msg = response.error.message
      }
      console.log("Could not remove user", response)
      setErrorMsg("Could not remove user: " + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h4>{
        (mode === ROL_CHOFER) ? t("drivers.heading") : t("users.heading")
      }</h4>
      <hr />
      {
        errorMsg && (
          <div className="alert alert-danger mb-2">{errorMsg}</div>
        )
      }
      {
        (mode === ROL_CHOFER) ?
          (driversRequests.length > 0) && (
            <>
              <h5>
                {
                  t("drivers.requests", {length: driversRequests.length})
                }
              </h5>
              {
                driversRequests.map(driver => (
                  <div className="card mb-2" key={driver.email}>
                    <div className="card-body">
                      <h6>{t("drivers.details.name")}: {driver.username}</h6>
                      <h6>{t("drivers.details.email")}: {driver.email}</h6>
                      <div>
                        <button
                          className="btn btn-primary"
                          onClick={() => processRequest(driver.id, true)}
                          disabled={loading || (drivers.length > 0)}
                        >{t("drivers.actions.accept")}</button>
                        <button
                          className="btn btn-danger ms-3"
                          onClick={() => processRequest(driver.id, false)}
                          disabled={loading}
                        >{t("drivers.actions.reject")}</button>
                      </div>
                    </div>
                  </div>)
                )
              }
              <hr />
            </>
          )
        : (usersRequests.length > 0) && (
          <>
            <h5>
              {
                t("users.requests", { length: usersRequests.length })
              }
            </h5>
            {
              usersRequests.map(user => (
                <div className="card mb-2" key={user.email}>
                  <div className="card-body">
                    <h6>{t("users.details.name")}: {user.username}</h6>
                    <h6>{t("users.details.email")}: {user.email}</h6>
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => processRequest(user.id, true)}
                        disabled={loading}
                      >{t("users.actions.accept")}</button>
                      <button
                        className="btn btn-danger ms-3"
                        onClick={() => processRequest(user.id, false)}
                        disabled={loading}
                      >{t("users.actions.reject")}</button>
                    </div>
                  </div>
                </div>)
              )
            }
            <hr />
          </>
        )
      }
      {
        (mode === ROL_CHOFER) ? (
          <h5>
            {
              t("drivers.quantity", {length: drivers.length})
            }
          </h5>
        ) : (
          <h5>
            {
              t("users.quantity", {length: users.length})
            }
          </h5>
        )
      }
      <div className="alert alert-primary">
        {t("tip.p1")} <span className="fw-bold">{organization.code}</span> {t("tip.p2")}
      </div>
      {
        (mode === ROL_CHOFER) ?
          drivers.map(driver => (
            <div className="card mb-2" key={driver.email}>
              <div className="card-body">
                <h6>{t("drivers.details.name")}: {driver.username}</h6>
                <h6>{t("drivers.details.email")}: {driver.email}</h6>
                <h6>{t("drivers.details.route")}: {driver.ruta ? driver.ruta.nombre : "N/A"}</h6>
                <select
                  className="form-select"
                  aria-label={"Set a route to "+driver.username}
                  value={selectedRoute}
                  onChange={handleChangeSelectedRoute}
                >
                  {
                    [DEFAULT_SELECT_VALUE]
                    .concat(organization.rutas)
                    .map(ruta => (
                      <option
                        key={`ruta-${ruta.id}`}
                        value={ruta.id}
                      >{ruta.nombre}</option>
                    ))
                  }
                </select>
                <div className="d-flex flex-row-reverse justify-content-between mt-2">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => removeUser(driver)}
                    disabled={loading}
                  >{t("drivers.actions.remove")}</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setRoute(driver)}
                    disabled={loading}
                  >{t("drivers.actions.update")}</button>
                </div>
              </div>
            </div>)
          )
        : users.map(user => (
            <div className="card mb-2" key={user.email}>
              <div className="card-body">
                <h6>{t("users.details.name")}: {user.username}</h6>
                <h6>{t("users.details.email")}: {user.email}</h6>
                <div className="d-flex flex-row-reverse justify-content-between mt-2">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => removeUser(user)}
                    disabled={loading}
                  >{t("users.actions.remove")}</button>
                </div>
              </div>
            </div>
          )
        )
      }
    </>
  )
}

export default UsersTab
