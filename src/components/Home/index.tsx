import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";

/**
 * Storefront home page.
 *
 * We intentionally keep the home page focused on real catalogue data.
 * Template-only promotional/testimonial sections can be reintroduced later
 * when the shop owner has real offers/content to put in them.
 */
const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <NewArrival />
      <BestSeller />
    </main>
  );
};

export default Home;
