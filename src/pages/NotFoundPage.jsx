import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-brand-400 shadow-glow"
        >
          <PawPrint className="size-12 text-on-brand" />
        </motion.div>
        <h1 className="mt-8 text-7xl font-extrabold tracking-tight text-ink">404</h1>
        <p className="mt-3 text-muted">This page wandered off chasing a squirrel.</p>
        <Link to="/app" className={buttonStyles({ size: 'lg', className: 'mt-8' })}>
          Take me home
        </Link>
      </div>
    </div>
  );
}
