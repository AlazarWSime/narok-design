import type { Metadata } from "next";
import InnerPage from "../components/InnerPage";

export const metadata: Metadata = {
  title: "About | NAROK DESIGN",
  description: "Discover the Ethiopian designer and Addis Ababa story behind NAROK DESIGN.",
};

export default function AboutPage() {
  return <InnerPage kind="about" />;
}
