import { useState, useEffect } from 'react';
import { sanitize } from '../lib/miscellaneous';
import { useTranslation } from 'react-i18next';

interface NewsletterFormProps {
  status: string | null
  message: string | null | Error
  onValidated: (_: any) => void
}

const NewsletterForm = ( { status, message, onValidated }: NewsletterFormProps) => {

  const [ error, setError ] = useState<string | null>(null);
  const [ email, setEmail ] = useState<string | null>(null);

  const { t } = useTranslation("newsletter")

  /**
   * Handle form submit.
   *
   * @return {{value}|*|boolean|null}
   */
  const handleFormSubmit = () => {

    setError(null);

    if ( ! email ) {
      setError( t("invalid_email") );
      return null;
    }

    const isFormValidated = onValidated({ EMAIL: email });

    // On success return true
    return email && email.indexOf("@") > -1 && isFormValidated;
  }

  /**
   * Handle Input Key Event.
   *
   * @param event
   */
  const handleInputKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setError(null);
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      handleFormSubmit();
    }
  }

  /**
   * Extract message from string.
   *
   * @param {String} message
   * @return {null|*}
   */
  const getMessage = (message: string | Error | null) => {
    if ( !message ) {
      return null;
    }
    let result

    if (typeof message === "string") {
      result = message.split('-') ?? null;
    }

    if ( "0" !== result?.[0]?.trim() ) {
      return sanitize(message.toString());
    }
    const formattedMessage = result?.[1]?.trim() ?? null;
    return formattedMessage ? sanitize( formattedMessage ) : null;
  }

  return (
    <div>
      <h3 className="mb-1 uppercase fw-bold">{t("heading")}</h3>
      <div className="d-flex flex-column">
        <input
          onChange={(event) => setEmail(event?.target?.value ?? '')}
          type="email"
          placeholder="email"
          className="form-control"
          onKeyUp={(event) => handleInputKeyEvent(event)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleFormSubmit}
          disabled={status === "sending"}
        >
          { status === "sending" ? t("loading") : t("action")}
        </button>
      </div>
      <div className="small">
        {'error' === status || error ? (
          <div
            className="text-danger pt-2"
            dangerouslySetInnerHTML={{ __html: error || getMessage( message ) }}
          />
        ) : null }
        {'success' === status && !error && (
          <div className="text-success fw-bold pt-2" dangerouslySetInnerHTML={{ __html: sanitize(message) }} />
        )}
      </div>
    </div>
  );
}

export default NewsletterForm