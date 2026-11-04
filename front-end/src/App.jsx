import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./components/Welcome";
import Register from "./components/Register";
import AccountCreated from "./components/AccountCreated";
import Login from "./components/Login";
import PasswordRecovery from "./components/PasswordRecovery";
import { AuthProvider } from "./auth/AuthContext";
import ResetPassword from "./components/ResetPassword";
import ResetConfirmation from "./components/ResetConfirmation";
import MainScreen from "./components/MainScreen";
import Game from "./components/Game";
// import GameOld from "./components/GameOld";
import Settings from "./components/Settings";
import SaveLoad from "./components/SaveLoad";
import ChooseCharacter from "./components/ChooseCharacter";
import CharacterChat from "./components/CharacterChat";
import Inventory from "./components/Inventory";
import Collections from "./components/Collections";
import Plots from "./components/Plots";

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
          <Route path="/starting" element={<MainScreen />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/:page" element={<Game />} />
          <Route path="/game/:page/settings" element={<Settings />} />
          <Route path="/game/:page/save-load" element={<SaveLoad />} />
          {/* Old game reader
          <Route path="/game-old" element={<GameOld />} />
          <Route path="/game-old/:page" element={<GameOld />} />
          <Route path="/game-old/:page/settings" element={<Settings gamePath="/game-old" />} />
          <Route path="/game-old/:page/save-load" element={<SaveLoad gamePath="/game-old" />} />
          */}
          <Route path="/chat" element={<ChooseCharacter />} />
          <Route path="/chat/:name" element={<CharacterChat />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/plots/chapters/text" element={<Navigate to="/plots/chapters/first-investigation" replace />} />
          <Route path="/plots/:category?/:entryId?" element={<Plots />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
