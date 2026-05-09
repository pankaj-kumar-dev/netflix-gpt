import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../utils/firebase";
import { LOGO, SUPPORTED_LANGUAGES } from "../utils/constants";
import { toggleGptSearchView } from "../utils/gptSlice";
import { changeLanguage } from "../utils/configSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user.currentUser);
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleLanguageChange = (e) => {
    dispatch(changeLanguage(e.target.value));
  };

  const handleGptSearchClick = () => {
    dispatch(toggleGptSearchView());
  };

  return (
    <div className="absolute px-4 py-1 bg-gradient-to-b from-black z-10 flex justify-between w-full">
      <img className="w-44" src={LOGO} alt="Netflix logo" />
      {user && (
        <div className="flex items-center space-x-4">
          <select
            className="p-2 m-2 bg-gray-900 text-white rounded"
            onChange={handleLanguageChange}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.IDENTIFIER} value={lang.IDENTIFIER}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            className="py-2 px-4 m-2 bg-purple-900 rounded-lg text-white hover:bg-purple-800 transition-colors"
            onClick={handleGptSearchClick}
          >
            {showGptSearch ? "Browse" : "GPT Search"}
          </button>
          {user.photoURL && (
            <img
              className="w-10 h-10 rounded"
              alt="user avatar"
              src={user.photoURL}
            />
          )}
          <button
            onClick={handleSignOut}
            className="font-bold text-white hover:text-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
