import React from "react";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Body from "./components/Body";

const App = () => (
  <Provider store={appStore}>
    <Body />
  </Provider>
);

export default App;
