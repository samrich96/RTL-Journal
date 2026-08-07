import { Link } from 'react-router'
import { paths } from '../routes/paths'
import './NotFound.css'

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p className="not-found__copy">
        That route doesn&apos;t exist yet. Head back and keep exploring.
      </p>
      <Link className="not-found__cta" to={paths.home}>
        Back to Discover
      </Link>
    </main>
  )
}
