import NextImage from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Container from 'components/Container';
import { media } from 'utils/media';

const PARTNER_LOGOS = [
  'google-logo-1.svg',
  'matane-production-logo-2.svg',
  'next-js-logo-3.svg',

];

export default function Partners() {
  return (
    <PartnersWrapper>
      <Title>special Thanks</Title>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={6}
        spaceBetween={30}
        loop={true}
        autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false, waitForTransition: false, stopOnLastSlide: false }}
        speed={2500}
        breakpoints={{
          320: { slidesPerView: 2 },
          768: { slidesPerView: 4 },
        }}
        className="swiper-wrapper"
      >
        {PARTNER_LOGOS.map((logo) => (
          <SwiperSlide key={logo}>
            <NextImage src={'/partners/' + logo} alt={normalizePartnerLogoName(logo)} width={128} height={128} />
          </SwiperSlide>
        ))}
      </Swiper>
    </PartnersWrapper>
  );
}

function normalizePartnerLogoName(logo: string) {
  return logo.replace('.svg', '');
}

const Title = styled.h3`
  font-size: 1.3rem;
  letter-spacing: 0.02em;
  line-height: 0;
  text-transform: uppercase;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.8;

  ${media('<=desktop')} {
    line-height: 1.5;
  }
`;

const PartnersWrapper = styled(Container)`
  .swiper-wrapper {
    will-change: transform;
    transition-timing-function: linear;
    margin-top: 0.5rem;
    user-select: none;
  }

  .swiper-slide {
    opacity: 0.8;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
`;
