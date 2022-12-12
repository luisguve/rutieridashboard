import { useState, useContext } from "react";
import { useTranslation } from 'react-i18next';

import { AuthContext, OrganizationContext } from "../../context"
import { STRAPI, ROL_CHOFER, ROL_PASAJERO } from "../../lib/constants"

const url = `${STRAPI}/api/organizations`

const HomeTab = () => {
  const [name, setName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(AuthContext);
  const { organizations, addOrg } = useContext(OrganizationContext)
  const { t } = useTranslation("home")

  const handleChangeName = (e: React.FormEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }
  const handleSubmit = () => {
    if (!user) {
      return
    }
    setErrorMsg("")
    setLoading(true)
    fetch(url, {
      method: "POST",
      body: JSON.stringify({name}),
      headers: {
        "Authorization": `Bearer ${user.token}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(res => {
      const fmtdOrg = {
        id: res.data.id,
        ...res.data.attributes,
        ...res
      }
      setName("")
      addOrg(fmtdOrg)
    })
    .catch(error => {
      console.log(error)
      setErrorMsg(t("error") || "Could not create organization")
    })
    .finally(() => {
      setLoading(false)
    })
  }
  return (
    <div>
      <h4>{t("heading")}</h4>
      <hr />
      <h5>{t("create")}</h5>
      <div className="mb-3">
        <label htmlFor="nameinput" className="form-label">{t("name")}</label>
        <input
          type="text"
          className="form-control mb-3"
          id="nameinput"
          value={name}
          onChange={handleChangeName}
          disabled={organizations.length > 0}
        />
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !name || (organizations.length > 0)}
        >{t("action")}</button>
      </div>
      {
        errorMsg && (
          <div className="alert alert-danger">{errorMsg}</div>
        )
      }

      {
        (organizations.length > 0) && (<>
          <h4>
            { t("quantity", {length: organizations.length}) }
          </h4>
          <hr />
          {organizations.map(org => (
            <div className="card mb-2" key={org.code}>
              <div className="card-body">
                <h6>{t("details.name")}: {org.name}</h6>
                <h6>{t("details.code")}: {org.code}</h6>
                <h6>{t("details.drivers")}: {org.users.filter(user => user.role.name === ROL_CHOFER).length}</h6>
                <h6>{t("details.users")}: {org.users.filter(user => user.role.name === ROL_PASAJERO).length}</h6>
                <h6>{t("details.routes")}: {org.rutas.length}</h6>
              </div>
              <div className="card-footer">
                {t("details.tip.p1")} <span className="fw-bold">{org.code}</span> {t("details.tip.p2")}
              </div>
            </div>
          ))}
        </>)
      }
    </div>
  )
}

export default HomeTab
