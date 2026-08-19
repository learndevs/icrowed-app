"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const STICKY_TOP_PX = 96;

export function ProductTopLayout({
  gallery,
  fixed,
  children,
}: Readonly<{ gallery: ReactNode; fixed: ReactNode; children: ReactNode }>) {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollingDetailsRef = useRef<HTMLDivElement>(null);
  const detailsContentRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef(0);
  const [runwayHeight, setRunwayHeight] = useState<number>();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const section = sectionRef.current;
    const galleryElement = galleryRef.current;
    const scrollingDetails = scrollingDetailsRef.current;
    const detailsContent = detailsContentRef.current;
    if (!section || !galleryElement || !scrollingDetails || !detailsContent) return;

    let frame = 0;

    const syncScroll = () => {
      frame = 0;
      if (!media.matches) return;
      const progress = STICKY_TOP_PX - section.getBoundingClientRect().top;
      scrollingDetails.scrollTop = Math.max(0, Math.min(progress, overflowRef.current));
    };

    const requestSync = () => {
      if (!frame) frame = requestAnimationFrame(syncScroll);
    };

    const measure = () => {
      if (!media.matches) {
        overflowRef.current = 0;
        scrollingDetails.scrollTop = 0;
        setRunwayHeight(undefined);
        return;
      }

      const visibleHeight = galleryElement.offsetHeight;
      const overflow = Math.max(detailsContent.scrollHeight - scrollingDetails.clientHeight, 0);
      overflowRef.current = overflow;
      setRunwayHeight(visibleHeight + overflow);
      requestSync();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(galleryElement);
    resizeObserver.observe(scrollingDetails);
    resizeObserver.observe(detailsContent);
    media.addEventListener("change", measure);
    window.addEventListener("scroll", requestSync, { passive: true });
    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      media.removeEventListener("change", measure);
      window.removeEventListener("scroll", requestSync);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative mb-4" style={{ height: runwayHeight }}>
      <div className="grid grid-cols-1 gap-4 lg:sticky lg:top-24 lg:grid-cols-2">
        <div ref={galleryRef} className="relative z-0">
          {gallery}
        </div>

        <div className="relative min-h-0">
          <div className="bento-card relative z-10 h-full overflow-visible lg:absolute lg:inset-0 lg:overflow-hidden">
            <div className="flex h-full flex-col p-5 sm:p-7">
              <div className="flex shrink-0 flex-col gap-5">{fixed}</div>
              <div
                ref={scrollingDetailsRef}
                className="min-h-0 flex-1 overflow-visible lg:overflow-hidden"
              >
                <div ref={detailsContentRef} className="flex flex-col gap-5 pt-5">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
