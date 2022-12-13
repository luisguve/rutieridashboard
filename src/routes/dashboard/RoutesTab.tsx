import { useState, useContext } from "react"
import { useTranslation } from 'react-i18next';

import Map from "../../components/Map"
import { OrganizationContext, AuthContext, IRuta } from "../../context"
import { STRAPI } from "../../lib/constants"

const RoutesTab = () => {
  const { t } = useTranslation("routes")
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
      setRuta(fmtdRuta, orgId)
    })
    .catch(error => {
      console.log(error)
      setErrorMsg(t("error") || "Could not create or edit route")
    })
    .finally(() => {
      setLoading(false)
    })
  }

  if (!organizations.length) {
    return (
      <>
        <h4>{t("heading")}</h4>
        <hr />
        <h5>{t("no_org")}</h5>
      </>
    )
  }

  return (
    <>
      <h4>{t("heading")}</h4>
      <hr />
      <h5>{ruta ? t("edit") : t("create")}</h5>
      <div className="mb-3">
        <label htmlFor="nombreinput" className="form-label">{t("details.name")}</label>
        <input
          type="text"
          className="form-control mb-3"
          id="nombreinput"
          value={nombre}
          onChange={handleChangeName}
        />
        <div>
          <h6>{t("details.coordinates")}</h6>
          <label htmlFor="latinput" className="form-label">{t("details.latitude")}</label>
          <input
            type="text"
            className="form-control mb-3"
            id="latinput"
            value={lat}
            onChange={handleChangeLat}
          />
          <label htmlFor="longtinput" className="form-label">{t("details.longitude")}</label>
          <input
            type="text"
            className="form-control mb-3"
            id="longtinput"
            value={longt}
            onChange={handleChangeLongt}
          />
        </div>
        <div>
          <Map
            value={geoJSON}
            onChange={setGeoJSON}
            latlong={{lat, longt}}
            id={ruta ? ruta.id : null}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !(nombre || geoJSON || lat || longt)}
        >{ruta ? t("edit") : t("create")}</button>
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
