import { gql } from '@apollo/client';

export const HELLO = gql`
  query Hello {
    hello
  }
`