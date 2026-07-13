import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PersistGate } from "redux-persist/integration/react";

import { persistor, Store } from "./state/store";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <PersistGate loading={null} persistor={persistor}>
    <Provider store={Store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StrictMode>
            <App />
          </StrictMode>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </PersistGate>
);
