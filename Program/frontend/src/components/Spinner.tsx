import "../stylesheets/Spinner.css";

type Props = { text?: string };

export default function Spinner({ text = "Loading your dashboard" }: Props) {
    return (
        <div className="spinnerWrap" role="status" aria-live="polite">
            <div className="spinner" />
            <div className="spinnerText">{text}</div>
        </div>
    );
}
