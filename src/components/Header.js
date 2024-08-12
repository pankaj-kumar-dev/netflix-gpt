import React from "react";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector(store => store.user);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        navigate("/error");
      });
  };

  return (
    <div className="absolute px-4 py-1 bg-gradient-to-b from-black z-10 flex justify-between w-full">
      <img
        className="w-44"
        src="https://imgs.search.brave.com/feraj0lC7U1Kdffd_Q9fmZWh5Shy_DT-KDqOJxa9ebA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZnJlZXBuZ2xvZ29z/LmNvbS91cGxvYWRz/L25ldGZsaXgtbG9n/by0wLnBuZw"
        alt="logo"
      />
     {user && ( 
     <div className="flex items-center space-x-4">
            <img
              className="w-14 h-14"
              alt="usericon"
              src={user.photoURL}
            />
            <button onClick={handleSignOut} className="font-bold text-white">
              Sign Out
            </button>
         
      </div>
     )}
    </div>
  );
}; 

export default Header;
