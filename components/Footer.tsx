import styled from 'styled-components';
import { media } from 'utils/media';

export default function Footer() {
  return (
    <FooterWrapper>
        <BottomBar>
          <Copyright>&copy; Copyright 070724 Rraf-project</Copyright>
        </BottomBar>
    </FooterWrapper>
  );
}

const FooterWrapper = styled.div`
  background: rgb(var(--secondary));
  color: rgb(var(--textSecondary));
`;

const Copyright = styled.p`
  font-size: 1.5rem;
  margin-top: 0.5rem;
`;

const BottomBar = styled.div`
  margin-top: 6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media('<=tablet')} {
    flex-direction: column;
  }
`;
