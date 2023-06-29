import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import styles from './stylesCarousel.module.css';

type CarouselProps = {
  children: React.ReactNode;
  brackPoint?: number;
};

export default function Carousel(props: CarouselProps) {
  const { children } = props;
  const childrenCount = useMemo(
    () => React.Children.count(children),
    [children]
  );

  const carouselContentRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [mouseMoveX, setMouseX] = React.useState(0);

  const randomId = useMemo(() => Math.random().toString(36).substring(7), []);

  useEffect(() => {
    if (carouselContentRef.current) {
      const carouselContent = carouselContentRef.current;
      carouselContent.style.setProperty(
        '--actives-index',
        currentIndex.toString()
      );
    }
  }, [currentIndex, carouselContentRef.current]);

  useEffect(() => {
    if (mouseDown) return;
    const nextTimer = setTimeout(handleNext, 3000);

    return () => clearTimeout(nextTimer);
  }, [mouseDown]);

  // desktop
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setMouseDown(true);
    setMouseX(e.clientX);
  }, []);

  const handleMouseUp = useCallback(
    (e) => {
      e.preventDefault();
      setMouseDown(false);
      const moveX = e.clientX - mouseMoveX;
      if (carouselContentRef.current) {
        const carouselContent = carouselContentRef.current;
        carouselContent.style.setProperty('--mouse-move-x', `0px`);
      }
      moveX > 0 ? handlePrev() : handleNext();
    },
    [mouseMoveX, carouselContentRef.current]
  );

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!mouseDown) return;
      const moveX = e.clientX - mouseMoveX;

      if (carouselContentRef.current) {
        const carouselContent = carouselContentRef.current;
        carouselContent.style.setProperty('--mouse-move-x', `${moveX}px`);
      }
    },
    [mouseDown, mouseMoveX, carouselContentRef.current]
  );

  // pad & phone
  const handleTouchDown = useCallback((e) => {
    setMouseDown(true);
    setMouseX(e.touches[0].clientX);
  }, []);

  const handleTouchUp = useCallback(
    (e) => {
      setMouseDown(false);
      const moveX = e.changedTouches[0].clientX - mouseMoveX;
      if (carouselContentRef.current) {
        const carouselContent = carouselContentRef.current;
        carouselContent.style.setProperty('--mouse-move-x', `0px`);
      }

      moveX > 0 ? handlePrev() : handleNext();
    },
    [mouseMoveX, carouselContentRef.current]
  );

  const handleTouchMove = useCallback(
    (e) => {
      const moveX = e.touches[0].clientX - mouseMoveX;
      if (carouselContentRef.current) {
        const carouselContent = carouselContentRef.current;
        carouselContent.style.setProperty('--mouse-move-x', `${moveX}px`);
      }
    },
    [mouseMoveX, carouselContentRef.current]
  );

  const handleNext = () => {
    if (currentIndex < childrenCount - 1) {
      return setCurrentIndex(currentIndex + 1);
    }
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      return setCurrentIndex(currentIndex - 1);
    }
    return setCurrentIndex(childrenCount - 1);
  };

  const CarouselInput = () => (
    <div className={styles.carousel_input}>
      {new Array(childrenCount).fill(0).map((_, index) => (
        <input
          key={index}
          type="radio"
          name="carousel"
          id={`carousel_children_${randomId}_${index}`}
          defaultChecked={index === currentIndex}
          onChange={() => setCurrentIndex(index)}
        />
      ))}
    </div>
  );

  const CarouselChildren = useCallback(
    () => (
      <div ref={carouselContentRef} className={`${styles.carousel_content}`}>
        {React.Children.map(children, (child) => {
          return (
            <label className={styles.carousel_content_item}>{child}</label>
          );
        })}
      </div>
    ),
    [children]
  );

  const Dots = () => {
    return (
      <div className={styles.dots}>
        {Array.from({ length: childrenCount }).map((_, index) => (
          <label
            className={`${currentIndex === index ? styles.active : ''}`}
            key={index}
            htmlFor={`carousel_children_${randomId}_${index}`}
          ></label>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.carousel}>
      <CarouselInput />
      <div
        className={styles.carousel_drag}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchDown}
        onTouchEnd={handleTouchUp}
        onTouchMove={handleTouchMove}
      >
        <CarouselChildren />
      </div>
      <Dots />
    </div>
  );
}
