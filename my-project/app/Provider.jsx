import * as React from "react";

// 1. import `HeroUIProvider` component
import {HeroUIProvider} from "@heroui/react";

export default function Provider({children}) {
  // 2. Wrap HeroUIProvider at the root of your app
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}