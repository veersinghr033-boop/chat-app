"use client";

import { Spin } from "antd";
import { Provider } from "react-redux";
import { store } from "../../lib/store/store";
import { persistor } from "@/lib/store/store";
import { PersistGate } from "redux-persist/integration/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Spin size="large" />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
