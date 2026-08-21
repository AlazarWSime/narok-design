import type { Metadata } from "next";
import InnerPage from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Shop | NAROK DESIGN",
  description: "Shop sample ready-made and made-to-order Ethiopian traditional clothing for women, men and children.",
};

export default function ShopPage() {
  return <InnerPage kind="shop" />;
}
