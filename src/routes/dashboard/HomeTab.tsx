import { useState, useContext } from "react";

import { AuthContext, OrganizationContext } from "../../context"
import { STRAPI, ROL_CHOFER, ROL_PASAJERO } from "../../lib/constants"

const url = `${STRAPI}/api/organizations`

const HomeTab = () => {
  const [name, setName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(AuthContext);
  const { organizations, addOrg } = useContext(OrganizationContext)

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
      setErrorMsg("Could not create organization")
    })
    .finally(() => {
      setLoading(false)
    })
  }
  return (
    <div>
      <h4>home</h4>
      <hr />
      <h5>Create an organisation</h5>
      <div className="mb-3">
        <label htmlFor="nameinput" className="form-label">Organization name</label>
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
        >Create organization</button>
      </div>
      {
        errorMsg && (
          <div className="alert alert-danger">{errorMsg}</div>
        )
      }

      {
        (organizations.length > 0) && (<>
          <h4>{organizations.length} organization{(organizations.length > 1) ? "s" : ""}</h4>
          <hr />
          {organizations.map(org => (
            <div className="card mb-2" key={org.code}>
              <div className="card-body">
                <h6>Name: {org.name}</h6>
                <h6>Code: {org.code}</h6>
                <h6>Drivers: {org.users.filter(user => user.role.name === ROL_CHOFER).length}</h6>
                <h6>Users: {org.users.filter(user => user.role.name === ROL_PASAJERO).length}</h6>
                <h6>Routes: {org.rutas.length}</h6>
              </div>
            </div>
          ))}
        </>)
      }
    </div>
  )
}

export default HomeTab
