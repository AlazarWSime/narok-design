import type { Metadata } from "next";
import Checkout from "./Checkout";
import "./checkout.css";

export const metadata: Metadata = { title: "Checkout | NAROK DESIGN", description: "Confirm delivery and payment details for your NAROK DESIGN order.", robots: { index: false, follow: false } };

export default function CheckoutPage() { return <Checkout />; }
