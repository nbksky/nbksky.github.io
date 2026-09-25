export default function PageHero({ title, subtitle, image }) {
  return (
    <section
      className={`page-hero ${image ? "page-hero--image" : ""}`}
      style={image ? { "--hero-img": `url(${image})` } : undefined}
    >
      <div className="container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
