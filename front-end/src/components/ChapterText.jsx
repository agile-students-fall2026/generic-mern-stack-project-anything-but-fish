import { useNavigate } from "react-router-dom";

export default function ChapterText() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Chapter text</p>
      <button onClick={() => navigate("/plots/chapters")}>Back</button>
    </div>
  );
}
