export default function Navbar({ dashboard }: { dashboard: boolean }) {
  return <nav className="navbar">
    <ul className="links-container">
      <li className="active">
        <a href={`${dashboard ? "/dashboard" : ""}/`}>Mouvements</a>
      </li>
      <li>
        <a href={`${dashboard ? "/dashboard" : ""}/artistes`}>Artistes</a>
      </li>
      <li>
        <a href={`${dashboard ? "/dashboard" : ""}/autres`}>Autres</a>
      </li>
    </ul>
  </nav>
}
