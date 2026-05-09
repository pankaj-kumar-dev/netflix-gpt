import React, { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { addUser } from "../utils/userSlice";
import { checkValidData } from "../utils/validate";
import { BG_URL, User_Avatar } from "../utils/constants";
import Header from "./Header";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((store) => store.user);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Already logged in — AuthListener will navigate, but this is a safety net
  if (currentUser) return <Navigate to="/browse" replace />;

  const handleSubmit = async () => {
    const validationError = checkValidData(
      emailRef.current.value,
      passwordRef.current.value
    );
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!isSignInForm) {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passwordRef.current.value
        );
        await updateProfile(user, {
          displayName: nameRef.current.value,
          photoURL: User_Avatar,
        });
        const { uid, email, displayName, photoURL } = auth.currentUser;
        dispatch(addUser({ uid, email, displayName, photoURL }));
        // AuthListener's onAuthStateChanged fires and navigates to /browse
      } else {
        await signInWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passwordRef.current.value
        );
        // AuthListener's onAuthStateChanged fires and navigates to /browse
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="absolute">
        <img alt="background" src={BG_URL} />
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-3/12 absolute p-12 bg-black my-36 mx-auto right-0 left-0 text-white rounded-lg bg-opacity-80"
      >
        <h1 className="font-bold text-3xl py-4">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignInForm && (
          <input
            ref={nameRef}
            type="text"
            placeholder="Full Name"
            className="p-4 my-2 w-full bg-gray-700 rounded"
          />
        )}
        <input
          ref={emailRef}
          type="email"
          placeholder="Email address"
          className="p-4 my-2 w-full bg-gray-700 rounded"
        />
        <input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          className="p-4 my-2 w-full bg-gray-700 rounded"
        />
        {errorMessage && (
          <p className="text-red-500 font-bold text-sm py-2">{errorMessage}</p>
        )}
        <button
          className="p-4 my-6 bg-red-700 w-full rounded-lg disabled:opacity-60 hover:bg-red-600 transition-colors"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : isSignInForm ? "Sign In" : "Sign Up"}
        </button>
        <p
          className="py-4 cursor-pointer hover:underline"
          onClick={() => setIsSignInForm(!isSignInForm)}
        >
          {isSignInForm
            ? "New to Netflix? Sign Up Now"
            : "Already a user? Sign In Now"}
        </p>
      </form>
    </div>
  );
};

export default Login;
