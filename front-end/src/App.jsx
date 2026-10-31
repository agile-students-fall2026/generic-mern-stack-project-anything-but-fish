import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./components/Welcome";
import Register from "./components/Register";
import AccountCreated from "./components/AccountCreated";
import Login from "./components/Login";
import PasswordRecovery from "./components/PasswordRecovery";
import { AuthProvider, RequireAuth } from "./auth/AuthContext";
import ResetPassword from "./components/ResetPassword";
import ResetConfirmation from "./components/ResetConfirmation";
import MainScreen from "./components/MainScreen";
import Game from "./components/Game";
import Settings from "./components/Settings";
import SaveLoad from "./components/SaveLoad";
import NPCChat from "./components/NPCChat";
import ChooseCharacter from "./components/ChooseCharacter";
import CharacterChat from "./components/CharacterChat";
import Inventory from "./components/Inventory";
import Collections from "./components/Collections";
import CollectedObjects from "./components/CollectedObjects";
import Plots from "./components/Plots";
import CharacterBiographies from "./components/CharacterBiographies";
import ChapterSelection from "./components/ChapterSelection";
import ChapterText from "./components/ChapterText";
import ObjectDescriptions from "./components/ObjectDescriptions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        <Route element={<RequireAuth />}>
        <Route path="/starting" element={<MainScreen />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/:page" element={<Game />} />
        <Route path="/game/:page/settings" element={<Settings />} />
        <Route path="/game/:page/save-load" element={<SaveLoad />} />
        <Route path="/npc-chat" element={<NPCChat />} />
        <Route path="/choose-character" element={<ChooseCharacter />} />
        <Route path="/character-chat" element={<CharacterChat />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/objects" element={<CollectedObjects />} />
        <Route path="/plots" element={<Plots />} />
        <Route path="/plots/characters" element={<CharacterBiographies />} />
        <Route path="/plots/chapters" element={<ChapterSelection />} />
        <Route path="/plots/chapters/text" element={<ChapterText />} />
        <Route path="/plots/objects" element={<ObjectDescriptions />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
