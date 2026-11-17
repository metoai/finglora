/**
 * Finglora Micro-Motion Engine
 * Agency-grade, non-slop tactile animations and transitions.
 * Powered by Anime.js & Framer Motion physics.
 */

import { animate, stagger } from 'animejs';

export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;
export const LUXURY_EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Subtle tactile tap animation for buttons and cards.
 * Shrinks by 1.5% and releases with damped spring.
 */
export function triggerTactileFeedback(target: HTMLElement | null) {
  if (!target) return;
  animate(target, {
    scale: [1, 0.985, 1],
    duration: 220,
    ease: 'cubicBezier(0.16, 1, 0.3, 1)',
  });
}

/**
 * Tactile micro-shake for validation cues or limits reached
 */
export function triggerMicroSubtleShake(target: HTMLElement | null) {
  if (!target) return;
  animate(target, {
    translateX: [-3, 3, -2, 2, 0],
    duration: 200,
    ease: 'easeInOutQuad',
  });
}

/**
 * Staggered entrance for list of nail cards or catalog items
 */
export function animateStaggerEntrance(selector: string | HTMLElement[], delayBase = 40) {
  animate(selector, {
    opacity: [0, 1],
    translateY: [8, 0],
    delay: stagger(delayBase, { start: 50 }),
    duration: 380,
    ease: 'cubicBezier(0.16, 1, 0.3, 1)',
  });
}

/**
 * Framer-motion transition configurations for quiet luxury UI
 */
export const agencyMotionVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: LUXURY_EASE } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: LUXURY_EASE } },
  },
  dialog: {
    initial: { opacity: 0, scale: 0.98, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.24, ease: LUXURY_EASE } },
    exit: { opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.16, ease: LUXURY_EASE } },
  },
  cardHover: {
    rest: { y: 0, transition: { duration: 0.2, ease: LUXURY_EASE } },
    hover: { y: -2, transition: { duration: 0.2, ease: LUXURY_EASE } },
  },
};
