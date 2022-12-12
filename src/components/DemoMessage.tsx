import { useTranslation } from "react-i18next"

const DemoMessage = () => {
  const { t } = useTranslation("demo");
  return (
    <div className="alert alert-info">
      <p className="text-center">
        {t("p1")}
      </p>
      <p className="mb-0 text-center">
        {t("p2")}
      </p>
    </div>
  )
}

export default DemoMessage