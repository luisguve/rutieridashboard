import { useState, useContext } from "react"

import { STRAPI } from "../lib/urls"
import AuthContext from "../context/AuthContext"

interface ILoginProps {
  onLogin: () => void
}

const StrapiLogin = ({onLogin}: ILoginProps) => {
  return (
    <div className="row mb-4 p-0">
      <div className="col-12 col-md-6 mx-auto">
        <LoginForm onLogin={onLogin}/>
        <div className="mt-5">
          <RegisterForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  )
}

export default StrapiLogin

const RegisterForm = ({onLogin}: ILoginProps) => {
  const { loginUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [username, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const validInputs = () => {
    return username !== "" && email !== "" && password !== "" && password2 !== ""
  }
  const handleName = (e: React.FormEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }
  const handleEmail = (e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }
  const handlePassword = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
  }
  const handlePassword2 = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword2(e.currentTarget.value)
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validInputs()) {
      return
    }
    if (!(password === password2)) {
      alert("Both passwords must be equal")
      return
    }
    setLoading(true)
    setErrorMsg("")
    const url = `${STRAPI}/api/auth/local/register`
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    })
    .then(async res => {
      const body = await res.json()
      if (!res.ok) {
        throw body
      }
      return body
    })
    .then((data) => {
      loginUser({
        username,
        email,
        id: data.user.id,
        token: data.jwt
      })
      onLogin()
    })
    .catch(response => {
      let error = ""
      if (response.error) {
        error = response.error.message
      } else {
        error = "Unexpected error"
        console.log(response);
      }
      setErrorMsg(error)
    })
    .finally(() => {
      setLoading(false)
    });
  }
  let extraProps = {}
  if (!validInputs()) {
    extraProps = {
      disabled: "disabled"
    }
  }
  return (
    <div>
      <div className="d-flex flex-column border rounded p-1 p-md-3">
        <h4 className="fs-5 text-center">Register</h4>
        <form className="d-flex flex-column" onSubmit={handleSubmit}>
          <label className="d-flex flex-column mb-2">
            Full name
            <input className="form-control" type="text" value={username} onChange={handleName} required />
          </label>
          <label className="d-flex flex-column mb-2">
            Email address
            <input className="form-control" type="email" value={email} onChange={handleEmail} required />
          </label>
          <label className="d-flex flex-column mb-2">
            Password
            <input className="form-control"
              type={mostrar ? "text" : "password"}
              value={password}
              onChange={handlePassword}
              required
            />
          </label>
          <label className="d-flex flex-column mb-2">
            Confirm password
            <input className="form-control"
              type={mostrar ? "text" : "password"}
              value={password2}
              onChange={handlePassword2}
              required
            />
          </label>
          <label className="d-flex">
            <input
              className="form-check me-1"
              type="checkbox"
              value={mostrar ? "checked" : undefined}
              onChange={() => setMostrar(!mostrar)}
            />
            View password
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!validInputs() || loading}
          >Register</button>
        </form>
      </div>
      <div className="mt-2">
        <ErrorBox msg={errorMsg} />
      </div>
    </div>
  )
}
const LoginForm = ({onLogin}: ILoginProps) => {
  const { loginUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const validInputs = () => {
    return email !== "" && password !== ""
  }
  const handleEmail = (e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }
  const handlePassword = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validInputs()) {
      return
    }
    setLoading(true)
    setErrorMsg("")
    const url = `${STRAPI}/api/auth/local`
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        identifier: email,
        password
      })
    })
    .then(async res => {
      const body = await res.json()
      if (!res.ok) {
        throw body
      }
      return body
    })
    .then((data) => {
      loginUser({
        username: data.user.username,
        email: data.user.email,
        id: data.user.id,
        token: data.jwt
      })
      onLogin()
    })
    .catch(response => {
      let error = ""
      if (response.error) {
        error = response.error.message
      } else {
        error = "Unexpected error"
        console.log(response);
      }
      setErrorMsg(error)
    })
    .finally(() => {
      setLoading(false)
    });
  }
  return (
    <div>
      <div className="d-flex flex-column border rounded p-1 p-md-3">
        <h4 className="fs-5 text-center">Login</h4>
        <form className="d-flex flex-column" onSubmit={handleSubmit}>
          <label className="d-flex flex-column mb-2">
            Email address
            <input className="form-control" type="email" value={email} onChange={handleEmail} required />
          </label>
          <label className="d-flex flex-column mb-2">
            Password
            <input className="form-control" type="password" value={password} onChange={handlePassword} required />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!validInputs() || loading}
          >Login</button>
        </form>
      </div>
      <div className="mt-2">
        <ErrorBox msg={errorMsg} />
      </div>
    </div>
  )
}

const ErrorBox = ({msg}: {msg: string}) => {
  if (!msg) {
    return null
  }
  return (
    <div className="alert alert-danger">{msg}</div>
  )
}
