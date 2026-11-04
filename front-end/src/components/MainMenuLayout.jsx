import { useNavigate } from "react-router-dom";
import background from "../assets/main-screen/background.png";
import whiteLight from "../assets/main-screen/white-light.png";
import redLight from "../assets/main-screen/red-light.png";
import lineArt from "../assets/main-screen/line-art.png";
import "./MainScreen.css";

export default function MainMenuLayout({ menuItems, footer, children, label = "Main menu" }) {
  const navigate = useNavigate();

  return (
    <main className={`main-screen${footer ? " main-screen--with-footer" : ""}`} aria-label={label}>
      <div className="main-screen__canvas">
        {/* Bottom to top: background, light, line art, interactive menu. */}
        <div className="main-screen__artwork" aria-hidden="true">
          <img className="main-screen__layer" src={background} alt="" width="1500" height="3249" draggable={false} />
          <img className="main-screen__layer main-screen__white-light" src={whiteLight} alt="" width="1500" height="3249" draggable={false} />
          <img className="main-screen__layer main-screen__red-light" src={redLight} alt="" width="1500" height="3249" draggable={false} />
          <img className="main-screen__layer" src={lineArt} alt="" width="1500" height="3249" draggable={false} />
        </div>
        <nav className="main-screen__menu" aria-label="Main navigation">
          {menuItems.map(({ label, path }) => (
            <button className="main-screen__button" key={path} type="button" onClick={() => navigate(path)}>
              {label}
            </button>
          ))}
        </nav>
        {footer && <div className="main-screen__footer">{footer}</div>}
      </div>
      {children}
    </main>
  );
}
