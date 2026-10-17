import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
export const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
export const fontVars = `${sans.variable} ${serif.variable} ${mono.variable}`;
