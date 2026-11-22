import { useEffect, useState } from "react";
import { useGameData } from "../hooks/useGameData";
import ItemIcon from "./ItemIcon";
import bannerAsset from "../assets/inventory/item-acquired-banner.png";
import coinAsset from "../assets/inventory/coin.png";
import "./ItemAcquired.css";

export const itemAcquiredImages = [bannerAsset, coinAsset];

export default function ItemAcquired({ name, icon, count = 1, onDismiss }) {
  return (
    <div className="item-acquired" role="status" aria-live="polite" aria-atomic="true"
      aria-label={`Received ${name}, quantity ${count}`}
      onAnimationEnd={(event) => { if (event.target === event.currentTarget) onDismiss?.(); }}>
      <img className="item-acquired__banner" src={bannerAsset} alt="" draggable={false} />
      <ItemIcon icon={icon} className="item-acquired__icon" />
      <p className="item-acquired__text" aria-hidden="true">
        <span className="item-acquired__name">{name}</span>
        <span className="item-acquired__amount">+ <span>{count}</span></span>
      </p>
    </div>
  );
}

// Reward responses provide IDs and newly awarded counts; item details come from inventory.
export function ItemRewardNotifications({ rewards, onComplete }) {
  const { data, loading } = useGameData("inventory");
  const [index, setIndex] = useState(0);
  const availableRewards = rewards.filter((reward) => data?.items.some((item) => item.id === reward.itemId));
  const reward = availableRewards[index];
  const item = data?.items.find((entry) => entry.id === reward?.itemId);

  useEffect(() => {
    if (!loading && !reward) onComplete();
  }, [loading, reward, onComplete]);

  if (!item) return null;

  return (
    <ItemAcquired key={`${index}-${item.id}`} name={item.name} icon={item.icon} count={reward.count ?? 1}
      onDismiss={() => {
        if (index + 1 < availableRewards.length) setIndex(index + 1);
        else onComplete();
      }} />
  );
}
