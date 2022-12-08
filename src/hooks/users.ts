import { useContext } from "react"

import { OrganizationContext } from "../context"
import { ROL_PASAJERO, ROL_CHOFER } from "../lib/constants"

/********
  Users
*********/

export const useUsers = () => {
  const { organizations } = useContext(OrganizationContext)
  if (!organizations.length) {
    return []
  }
  return organizations[0].users.filter(({role}) => role.name === ROL_PASAJERO)
}

/********
  Drivers
*********/

export const useDrivers = () => {
  const { organizations } = useContext(OrganizationContext)
  if (!organizations.length) {
    return []
  }
  return organizations[0].users.filter(({role}) => role.name === ROL_CHOFER)
}

/********
  Requests
*********/

export const useDriversRequests = () => {
  const { organizations } = useContext(OrganizationContext)
  if (!organizations.length) {
    return []
  }
  return organizations[0].requests.filter(({role}) => role.name === ROL_CHOFER)
}

export const useUsersRequests = () => {
  const { organizations } = useContext(OrganizationContext)
  if (!organizations.length) {
    return []
  }
  return organizations[0].requests.filter(({role}) => role.name === ROL_PASAJERO)
}
