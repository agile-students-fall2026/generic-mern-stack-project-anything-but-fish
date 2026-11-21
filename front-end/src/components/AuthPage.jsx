import backgroundDocuments from "../assets/signup/background-documents.png";
import clipboard from "../assets/signup/clipboard.png";
import clipboardClip from "../assets/signup/clipboard-clip.png";
import fishingLine from "../assets/signup/fishing-line.png";
import pen from "../assets/signup/pen.png";
import note from "../assets/signup/note.png";
import logo from "../assets/signup/logo-placeholder.png";
import email from "../assets/signup/email.png";
import password from "../assets/signup/password.png";
import confirmation from "../assets/signup/confirm-password.png";
import registerText from "../assets/signup/create-account-text.png";
import registerFrame from "../assets/signup/create-account-frame.png";
import loginText from "../assets/auth/login-text.png";
import loginFrame from "../assets/auth/login-frame.png";
import recoveryTitle from "../assets/auth/recovery-title.png";
import recoveryText from "../assets/auth/send-reset-text.png";
import "./AuthPage.css";

const scenery = [backgroundDocuments, clipboard, clipboardClip, fishingLine, pen, note];
const artwork = {
  register: { labels: { email, password, confirmation }, text: registerText, frame: registerFrame },
  login: { labels: { email, password }, text: loginText, frame: loginFrame },
  recovery: { labels: { email }, title: recoveryTitle, text: recoveryText, frame: registerFrame },
  reset: { labels: { password, confirmation }, frame: registerFrame },
};

function Layer({ src, className = "" }) {
  return <img className={`auth-page__layer ${className}`} src={src} alt="" width="1500" height="3249" draggable={false} />;
}

export default function AuthPage({
  variant, title, fields, onSubmit, onInput, busy, error, status,
  buttonLabel, busyLabel, hideControls = false, footer,
}) {
  const art = artwork[variant];
  const feedback = error || (busy ? busyLabel : status);
  const feedbackId = `${variant}-feedback`;

  return (
    <main className={`auth-page auth-page--${variant}`} aria-label={title}>
      <form
        className="auth-page__canvas"
        onSubmit={onSubmit}
        onInput={onInput}
        aria-busy={busy}
        aria-label={title}
        aria-describedby={feedback ? feedbackId : undefined}
      >
        {scenery.slice(0, 3).map(src => <Layer key={src} src={src} />)}
        {!hideControls && <>
          {art.text && <Layer src={art.text} className="auth-page__button-text" />}
          <Layer src={art.frame} className="auth-page__button-frame" />
        </>}
        {scenery.slice(3).map(src => <Layer key={src} src={src} />)}
        <Layer src={logo} />
        {art.title && <Layer src={art.title} />}
        {Object.entries(art.labels).map(([name, src]) => (
          <Layer key={name} src={src} className={`auth-page__label-art auth-page__label-art--${name}`} />
        ))}
        {!hideControls && <>
          {fields.map(({ name, label, help, ...inputProps }) => (
            <div key={name}>
              <label className="auth-page__sr-only" htmlFor={`${variant}-${name}`}>{label}</label>
              <input
                {...inputProps}
                className={`auth-page__input auth-page__input--${name}`}
                id={`${variant}-${name}`}
                name={name}
                disabled={busy}
                aria-describedby={help ? `${variant}-${name}-help` : undefined}
              />
              {help && <span className="auth-page__sr-only" id={`${variant}-${name}-help`}>{help}</span>}
            </div>
          ))}
          <button
            className="auth-page__submit"
            type="submit"
            aria-label={busy ? busyLabel : buttonLabel}
            disabled={busy}
          >
            {!art.text && buttonLabel}
          </button>
        </>}
      </form>
      <div className="auth-page__messages">
        {feedback && <p className="auth-page__feedback" id={feedbackId} role={error ? "alert" : "status"}>{feedback}</p>}
        <nav className="auth-page__footer" aria-label="Account navigation">{footer}</nav>
      </div>
    </main>
  );
}
