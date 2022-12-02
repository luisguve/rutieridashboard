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
  drivers: Array<IUser>
  rutas: Array<IRuta>
  owner: IUser
  id: number
}

interface IOrganizationContext {
  organizations: Array<IOrganization>
  ruta: IRuta | null
  addOrg: (_: IOrganization) => void
  setOrgs: (_: Array<IOrganization>) => void
  setRuta: (_: IRuta) => void
}

const defaultContext: IOrganizationContext = {
  organizations: [],
  ruta: null,
  addOrg: (_: IOrganization) => {},
  setOrgs: (_: Array<IOrganization>) => {},
  setRuta: (_: IRuta) => {},
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

  const addOrg = (org: IOrganization) => {
    setOrganizations((prevState) => prevState.concat(org))
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

  return (
    <OrganizationContext.Provider value={{
      organizations,
      addOrg,
      setOrgs: setOrganizations,
      ruta,
      setRuta
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
