import type { Metadata } from "next";
import InnerPage from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Custom Orders | NAROK DESIGN",
  description: "Request made-to-measure Ethiopian traditional clothing with your preferred measurements, color and fabric.",
};

export default function CustomOrdersPage() {
  return <InnerPage kind="custom" />;
}
