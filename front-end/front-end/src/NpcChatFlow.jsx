import { useState } from "react";
import { chapters } from "./data/fakeData";
import ChapterSelect from "./screens/ChapterSelect";
import CharacterSelect from "./screens/CharacterSelect";
import ChatScreen from "./screens/ChatScreen";
import "./NpcChat.css";

// Controls which screen is visible. Mount this when the user presses
// "Chat With Characters" on the main page. `onExit` takes them back to the main menu.
export default function NpcChatFlow({ onExit }) {
  const [chapter, setChapter] = useState(null);     // null -> show chapters
  const [character, setCharacter] = useState(null); // null -> show characters
  // All conversations, kept so history survives going back and forth.
  // Example: { "2-3": [{from:"you", text:"hi"}, ...] }
  const [chats, setChats] = useState({});

  const chatKey = chapter && character ? `${chapter.id}-${character.id}` : null;

  function addMessage(msg) {
    setChats((prev) => ({ ...prev, [chatKey]: [...(prev[chatKey] || []), msg] }));
  }

  if (chapter && character) {
    return (
      <ChatScreen
        character={character}
        messages={chats[chatKey] || []}
        onSend={addMessage}
        onBack={() => setCharacter(null)}
      />
    );
  }
  if (chapter) {
    return <CharacterSelect chapter={chapter} onPick={setCharacter} onBack={() => setChapter(null)} />;
  }
  return <ChapterSelect chapters={chapters} onPick={setChapter} onBack={onExit} />;
}
