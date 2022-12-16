import { createContext, useState, useEffect } from "react"

import { IUser } from "./AuthContext"

export type FeaturesTypes = "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "GeometryCollection" | "Feature" | "FeatureCollection"

export interface IRuta {
  id: number
  nombre: string
  latlong: null | {
    lat: number,
    longt: number,
  },
  coords: {
    type: FeaturesTypes
    features: {
      type: string
      geometry: {
        type: string,
        coordinates: number[] | number[][]
      },
      properties: {
        name: string
      }
    }[]
  }
}

export interface IOrganization {
  name: string
  code: string
  requests: Array<IUser>
  users: Array<IUser>
  rutas: Array<IRuta>
  owner: IUser
  id: number
}

interface IOrganizationContext {
  organizations: Array<IOrganization>
  ruta: IRuta | null
  addOrg: (_: IOrganization) => void
  setOrgs: (_: Array<IOrganization>) => void
  setRuta: (_: IRuta, orgId: number) => void
  update: (_: IOrganization) => void
  updateDriver: (_: IUser) => void
}

const defaultContext: IOrganizationContext = {
  organizations: [],
  ruta: null,
  addOrg: (_: IOrganization) => {},
  setOrgs: (_: Array<IOrganization>) => {},
  setRuta: (_: IRuta, orgId: number) => {},
  update: (_: IOrganization) => {},
  updateDriver: (_: IUser) => {}
}

const OrganizationContext = createContext<IOrganizationContext>(defaultContext)

export interface ProviderProps {
  children: React.ReactNode
}

export const OrganizationProvider = (props: ProviderProps) => {
  const [organizations, setOrganizations] = useState<Array<IOrganization>>([])
  const [ruta, setRuta] = useState<IRuta | null>(() => {
    const rutas = organizations.reduce((list, org) => {
      return list.concat(org.rutas)
    }, [] as Array<IRuta>)
    return rutas.length ? rutas[0] : null
  })

  const setOrgs = (orgs: Array<IOrganization>) => {
    setOrganizations(() => orgs)
    saveSession(orgs)
  }

  const addOrg = (org: IOrganization) => {
    setOrgs(organizations.concat(org))
  }

  useEffect(() => {
    const rutas = organizations.reduce((list, org) => {
      return list.concat(org.rutas)
    }, [] as Array<IRuta>)
    setRuta(rutas.length ? rutas[0] : null)
  }, [organizations])

  /**
  * Try to get user data from local storage
  */
  const checkLocalData = () => {
    const { organizations } = getSession()
    if (organizations) {
      setOrganizations(organizations)
    }
  }
  useEffect(() => {
    checkLocalData()
  }, [])

  const update = (orgData: IOrganization) => {
    setOrgs(organizations.map(org => {
      if (org.code === orgData.code) {
        org = orgData
      }
      return org
    }))
  }
  const updateDriver = (targetUser: IUser) => {
    setOrganizations((prevData) => {
      return prevData.map(org => {
        org.users = org.users.map(u => {
          if (u.id === targetUser.id) {
            u = targetUser
          }
          return u
        })
        return org
      })
    })
  }
  const createUpdateRuta = (ruta: IRuta, orgId: number) => {
    setRuta(ruta)
    setOrganizations((prevState) => {
      return prevState.map(org => {
        if (org.id === orgId) {
          if (org.rutas.some(r => {r.id === ruta.id})) {
            org.rutas = org.rutas.map(r => {
              if (r.id === ruta.id) {
                r = ruta
              }
              return r
            })
          } else {
            org.rutas = [ruta]
          }
        }
        return org
      })
    })
  }

  return (
    <OrganizationContext.Provider value={{
      organizations,
      addOrg,
      setOrgs,
      ruta,
      setRuta: createUpdateRuta,
      update,
      updateDriver
    }}>
      {props.children}
    </OrganizationContext.Provider>
  )
}

export default OrganizationContext

const getSession = () => {
  if (typeof(Storage) !== undefined) {
    const rawData = localStorage.getItem("organizationsData")
    if (rawData) {
      const parsedData: Array<IOrganization> = JSON.parse(rawData)
      return {
        organizations: parsedData
      }
    }
  }
  return {}
}
const saveSession = (organizations: Array<IOrganization>) => {
  if (typeof(Storage) !== undefined) {
    localStorage.setItem("organizationsData", JSON.stringify(organizations))
  }
}
const cleanupSession = () => {
  if (typeof(Storage) !== undefined) {
    localStorage.removeItem("organizationsData")
  }
}
