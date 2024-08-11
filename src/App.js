import React from "react";
import Body from "./components/Body";
import { Provider } from "react-redux"; // Import Provider from react-redux
import appStore from "./utils/appStore"; // Import your Redux store

function App() {
  return (
    <Provider store={appStore}>
      <Body />
    </Provider>
  );
}

export default App;
