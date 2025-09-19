import Providers from "./providers";

import AppComponent from "./components/AppComponent";
import { sendMessage } from "./components/Message/sendMessage";
import { useEffect, useState } from "react";

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sendMessage({ event: "webviewReady" });
    setReady(true);
  }, []);

  if (!ready) return null; 

  return (
    <Providers>
      <AppComponent />
    </Providers>
  );
};


export default App;
