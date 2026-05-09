import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Browse from "./Browse";
import Login from "./Login";
import AuthListener from "./AuthListener";
import ProtectedRoute from "./common/ProtectedRoute";

const appRouter = createBrowserRouter([
  {
    element: <AuthListener />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/browse",
        element: (
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const Body = () => <RouterProvider router={appRouter} />;

export default Body;
