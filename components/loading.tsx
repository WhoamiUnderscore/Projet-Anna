export default function Loading({ loading } : { loading: boolean }) {
  return <section className="loading" style={ loading ? { opacity: "1" } : { opacity: "0" }}>
    <span className="loader"></span>
  </section>
}
