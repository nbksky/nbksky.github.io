import HeroBg from "./HeroBg";

export default function PageHero({ title, subtitle, image }) {
  return (
    <section className={`page-hero ${image ? "page-hero--image" : ""}`}>
      {image && <HeroBg image={image} />}
      <div className="container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
