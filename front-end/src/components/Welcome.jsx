import { Link } from "react-router-dom";
import MainMenuLayout from "./MainMenuLayout";

const menuItems = [
  { label: "Sign Up", path: "/register" },
  { label: "Login", path: "/login" },
];

export default function Welcome() {
  return (
    <MainMenuLayout
      label="Welcome"
      menuItems={menuItems}
      footer={<Link to="/starting">Continue without logging in</Link>}
    />
  );
}
