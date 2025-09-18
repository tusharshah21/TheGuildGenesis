import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy } from "wagmi/chains";

const projectId = import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID as
  | string
  | undefined;
console.log(projectId);
export const config = getDefaultConfig({
  appName: "The Guild Genesis",
  projectId: projectId ?? "",
  chains: [polygonAmoy],
  ssr: false,
});
