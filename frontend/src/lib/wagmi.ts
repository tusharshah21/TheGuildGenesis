import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  polygon,
  polygonAmoy,
} from "wagmi/chains";

const projectId = import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID as
  | string
  | undefined;
console.log(projectId);
export const config = getDefaultConfig({
  appName: "The Guild Genesis",
  projectId: projectId ?? "",
  chains: [mainnet, sepolia, arbitrum, arbitrumSepolia, polygon, polygonAmoy],
  ssr: false,
});
