import styled from 'styled-components';
import { media } from 'utils/media';

const RichText = styled.div`
  font-size: 1.8rem;
  opacity: 0.8;
  line-height: 1.6;

  ol {
    list-style: none;
    padding: 0;

    li {
      padding-left: 2rem;
      position: relative;

      & > * {
        display: inline-block;
        vertical-align: top;
      }

      &::before {
        position: absolute;
        content: 'L'; /* Centang */
        left: 0;
        top: 0;
        text-align: center;
        color: rgb(var(--primary)); /* Warna centang mengikuti warna variabel --primary */
        font-family: Arial, sans-serif;
        transform: scaleX(-1) rotate(-35deg);
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding-left: 2rem;
      position: relative;

      & > * {
        display: inline-block;
        vertical-align: top;
      }

      &::before {
        position: absolute;
        content: 'X';
        left: 0;
        top: 0;
        text-align: center;
        color: red; /* Warna merah untuk tanda silang */
        font-family: Arial, sans-serif;
        transform: scaleX(-1) rotate(0deg);
      }
    }
  }

  table {
    border-spacing: 0;
    border-radius: 5px;
    border-collapse: separate;
    table-layout: fixed;
  }

  th {
    background: rgb(var(--textSecondary));
  }

  th, td {
    border: 1px solid rgb(var(--textSecondary));
    padding: 1rem;
  }

  tr:nth-child(even) {
    background: rgb(var(--textSecondary));
  }

  ${media('<=desktop')} {
    font-size: 1.5rem;
  }
`;


export default RichText;
