import { useState, useContext } from "react"

import Map from "../../components/Map"
import { OrganizationContext, AuthContext, IRuta } from "../../context"
import { STRAPI } from "../../lib/urls"

const RoutesTab = () => {
  const { ruta, setRuta, organizations } = useContext(OrganizationContext)
  const { user } = useContext(AuthContext)
  const [nombre, setNombre] = useState(() => {
    if (ruta) {
      return ruta.nombre
    }
    return ""
  })
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [lat, setLat] = useState<number>(() => {
    if (ruta && ruta.latlong) {
      return ruta.latlong.lat
    }
    return 10.506098
  })
  const [longt, setLongt] = useState<number>(() => {
    if (ruta && ruta.latlong) {
      return ruta.latlong.longt
    }
    return -66.9146017
  })
  const [geoJSON, setGeoJSON] = useState<string>(() => {
    if (ruta) {
      return JSON.stringify(ruta.coords)
    }
    return ""
  })

  const orgId = organizations.length ? organizations[0].id : 0
  const url = `${STRAPI}/api/organizations/${orgId}/routes`

  const handleChangeName = (e: React.FormEvent<HTMLInputElement>) => {
    setNombre(e.currentTarget.value)
  }
  const handleChangeLat = (e: React.FormEvent<HTMLInputElement>) => {
    setLat(Number(e.currentTarget.value))
  }
  const handleChangeLongt = (e: React.FormEvent<HTMLInputElement>) => {
    setLongt(Number(e.currentTarget.value))
  }
  const handleSubmit = () => {
    if (!user) {
      return
    }
    setErrorMsg("")
    setLoading(true)
    fetch(url, {
      method: "POST",
      body: JSON.stringify({nombre, latlong: {lat, longt}, coords: geoJSON}),
      headers: {
        "Authorization": `Bearer ${user.token}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(res => {
      const fmtdRuta = {
        id: res.data.id,
        ...res.data.attributes,
        ...res
      }
      setRuta(fmtdRuta)
    })
    .catch(error => {
      console.log(error)
      setErrorMsg("Could not create organization")
    })
    .finally(() => {
      setLoading(false)
    })
  }

  if (!organizations.length) {
    return (
      <>
        <h4>routes</h4>
        <hr />
        <h5>Create an organization before creating a route</h5>
      </>
    )
  }

  return (
    <>
      <h4>routes</h4>
      <hr />
      <h5>{ruta ? "Edit route" : "Create a route"}</h5>
      <div className="mb-3">
        <label htmlFor="nombreinput" className="form-label">Route name</label>
        <input
          type="text"
          className="form-control mb-3"
          id="nombreinput"
          value={nombre}
          onChange={handleChangeName}
        />
        <div>
          <h6>Coordinates</h6>
          <label htmlFor="latinput" className="form-label">Latitude</label>
          <input
            type="text"
            className="form-control mb-3"
            id="latinput"
            value={lat}
            onChange={handleChangeLat}
          />
          <label htmlFor="longtinput" className="form-label">Longitude</label>
          <input
            type="text"
            className="form-control mb-3"
            id="longtinput"
            value={longt}
            onChange={handleChangeLongt}
          />
        </div>
        <div>
          <Map value={geoJSON} onChange={setGeoJSON} latlong={{lat, longt}} />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !(nombre || geoJSON || lat || longt)}
        >Set route</button>
      </div>
      {
        errorMsg && (
          <div className="alert alert-danger">{errorMsg}</div>
        )
      }
    </>
  )
}

export default RoutesTab