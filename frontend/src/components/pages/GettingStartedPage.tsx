import { AppWrapper } from "@/components/AppWrapper";
import React from "react";

export default function GettingStartedPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
        <a
          href="https://discord.gg/pg4UgaTr"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Join our Discord
        </a>
      </div>

      <ol className="list-decimal pl-6 space-y-6 text-gray-700">
        <li>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Install and set up MetaMask
            </h2>
            <p>
              Install the MetaMask browser extension or mobile app and create a
              wallet. Then add the Polygon Amoy test network in MetaMask (Chain
              ID 80002).
            </p>
            <div className="space-x-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Download MetaMask
              </a>
              <a
                href="https://chainlist.org/chain/80002"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Add Polygon Amoy via Chainlist
              </a>
            </div>
          </div>
        </li>

        <li>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Get Amoy testnet MATIC (gas)
            </h2>
            <p>
              You need a small amount of Amoy MATIC to make on‑chain actions.
              Ask in our Discord and a member will send you some testnet funds.
            </p>
            <a
              href="https://discord.gg/pg4UgaTr"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Request Amoy gas on Discord
            </a>
          </div>
        </li>

        <li>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Create your Guild profile</h2>
            <p>
              Head to the Profiles page, connect your wallet, and create your
              profile to start building your on‑chain reputation.
            </p>
            <a href="/profiles" className="text-indigo-600 hover:underline">
              Go to Profiles
            </a>
          </div>
        </li>

        <li>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Add a badge</h2>
            <p>
              Propose and create a new skill badge in the Badges page. Badges
              represent skills or contributions recognized by the community.
            </p>
            <a href="/badges" className="text-indigo-600 hover:underline">
              Go to Badges
            </a>
          </div>
        </li>

        <li>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Give a badge to someone</h2>
            <p>
              After collaborating, issue a badge attestation to a peer to
              acknowledge their work. This helps build credible, portable
              developer profiles.
            </p>
            <a href="/profiles" className="text-indigo-600 hover:underline">
              Find a profile to attest
            </a>
          </div>
        </li>
      </ol>
    </section>
  );
}
