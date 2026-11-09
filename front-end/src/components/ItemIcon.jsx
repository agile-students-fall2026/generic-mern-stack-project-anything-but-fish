export default function ItemIcon({ icon }) {
  let artwork;
  switch (icon) {
    case "coin":
      artwork = <><circle cx="32" cy="32" r="25" fill="#c2a45a" /><circle cx="32" cy="32" r="19" fill="none" stroke="#80632c" strokeWidth="2" /><path d="m32 17 9 15-9 15-9-15Z" fill="#8e7236" /></>;
      break;
    case "key":
      artwork = <><path d="M25 32 48 55l8-8-5-5-5 2-4-4 2-5-11-11Z" fill="#b6a175" /><circle cx="21" cy="20" r="14" fill="#b6a175" /><circle cx="21" cy="20" r="6" fill="#493e2d" stroke="none" /></>;
      break;
    case "notebook":
      artwork = <><path d="M16 9h34v46H16z" fill="#baa981" /><path d="M11 9h8v46h-8z" fill="#655f4a" /><path d="M25 21h17M25 28h17M25 35h12" fill="none" stroke="#62543c" strokeWidth="2" /><path d="M15 53h34" fill="none" stroke="#e0d3ad" strokeWidth="2" /></>;
      break;
    case "tape":
      artwork = <><rect x="6" y="14" width="52" height="37" rx="3" fill="#908f7e" /><rect x="12" y="20" width="40" height="16" rx="2" fill="#d2c9a9" /><circle cx="21" cy="28" r="5" fill="#534f43" /><circle cx="43" cy="28" r="5" fill="#534f43" /><path d="m18 50 4-10h20l4 10" fill="#625e50" /><path d="M29 28h6" stroke="#786c4f" strokeWidth="3" /></>;
      break;
    case "photograph":
      artwork = <><path d="M9 7h46v51H9z" fill="#ddd5be" /><path d="M14 12h36v32H14z" fill="#7f9690" /><circle cx="39" cy="21" r="5" fill="#ded3a5" stroke="none" /><path d="m14 40 12-15 10 12 6-7 8 10v4H14Z" fill="#485d50" stroke="none" /></>;
      break;
    default:
      artwork = <path d="m32 8 23 12v25L32 57 9 45V20Z" fill="#a58e68" />;
  }

  return <svg className="inventory__item-icon" viewBox="0 0 64 64" fill="none" stroke="#332c20" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork}</svg>;
}
