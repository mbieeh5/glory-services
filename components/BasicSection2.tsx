import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { media } from 'utils/media';
import Container from './Container';

export interface BasicSectionProps {

}


export default function BasicSection2({ children }: PropsWithChildren<BasicSectionProps>) {
  return (
    <BasicSectionWrapper>
      <ContentContainer>
        <RichText>{children}</RichText>
      </ContentContainer>
    </BasicSectionWrapper>
  );
}


const ContentContainer = styled.div`
  display: absolute;

`;

const BasicSectionWrapper = styled(Container)`
  padding-bottom: 1rem;
  padding-top: 1px;
  text-align: center;
  ${media('<=desktop')} {
    flex-direction: column;


  }
`;

const RichText = styled.div`
  font-size: 1.8rem;
  opacity: 0.8;
  line-height: 1.6;
  align-items:center;
  justify-content:center;
  ol,
  ul {
    list-style: none;
    padding: 0rem;

    li {
      padding-left: 2rem;
      position: relative;

      & > * {
        display: inline-block;
        vertical-align: top;
      }

      &::before {
        position: absolute;
        content: 'L';
        left: 0;
        top: 0;
        text-align: center;
        color: rgb(var(--primary));
        font-family: arial;
        transform: scaleX(-1) rotate(-35deg);
      }
    }
  }

  ${media('<=desktop')} {
    font-size: 1.5rem;
  }
`;