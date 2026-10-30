import { useNavigate } from "react-router-dom";

export default function ChapterSelection() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Chapter Selection</p>
      <button onClick={() => navigate("/plots/chapters/text")}>Chapter text</button>
      <button onClick={() => navigate("/plots")}>Back</button>
    </div>
  );
}
