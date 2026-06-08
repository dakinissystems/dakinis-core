import { useLocale } from "../../context/LocaleContext.jsx";

export default function DemoRoiBenefits({ verticalKey }) {
  const { t } = useLocale();
  const benefits = t(`commercial.roi.${verticalKey}`) || [];

  if (!benefits.length) return null;

  return (
    <ul className="commercial-roi-list">
      {benefits.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
