import { GithubLogo, HeartFilledIcon } from '@/components/icons'

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-2 text-sm md:gap-4 md:flex-row text-secondary">
      <div className="inline-flex items-center gap-1 text-sm">
        <span>Made with</span>
        <HeartFilledIcon className="w-4 h-4" />
        <span>
          by{' '}
          <a
            href="https://planetscale.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors text-secondary hover:text-primary"
          >
            PlanetScale
          </a>
          {' '}/{' '}
          <a
            href="https://manifold.inc"
            target="_blank"
            rel="noreferrer"
            className="transition-colors text-secondary hover:text-primary"
          >
            Manifold
          </a>
        </span>
      </div>
      <a
        href="https://github.com/planetscale/beam"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm transition-colors text-secondary hover:text-primary"
      >
        <GithubLogo className="w-4 h-4" />
        <span>View on GitHub</span>
      </a>
    </footer>
  )
}
