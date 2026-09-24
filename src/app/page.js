import { html, attrs, partial } from "../../server/html.js";
import Header from "../components/Header.js";
import HeroSection from "../components/HeroSection.js";
import FeaturedFinds from "../components/FeaturedFinds.js";
import SellingSection from "../components/SellingSection.js";
import Footer from "../components/Footer.js";
export default function Home() {
    return (html `
<div class="min-h-screen bg-background">${partial(() => Header({}))}${partial(() => HeroSection({}))}${partial(() => FeaturedFinds({}))}${partial(() => SellingSection({}))}${partial(() => Footer({}))}</div>`);
}
