import { useNavigate, useParams } from "react-router-dom";

export default function Settings({ gamePath = "/game" }) {
  const navigate = useNavigate();
  const { page } = useParams();

  return (
    <div>
      <p>Settings</p>
      <button onClick={() => navigate(`${gamePath}/${page}`)}>Back</button>
    </div>
  );
}
