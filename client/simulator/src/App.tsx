import Providers from "./providers";

import AppComponent from "./components/AppComponent";
import { sendMessage } from "./components/Message/sendMessage";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    sendMessage({ event: "webviewReady" });

    return;
  }, []);

  return (
    <Providers>
      <AppComponent />
    </Providers>
  );
};

export default App;
