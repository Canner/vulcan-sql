import { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@vulcan-sql/catalog-server/components/Layout';
import apolloClient from '@vulcan-sql/catalog-server/lib/apollo';
import { ApolloProvider } from '@apollo/client';
import StoreProvider from '@vulcan-sql/catalog-server/lib/store';

require('@styles/main.less');

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Vulcan</title>
      </Head>
      <ApolloProvider client={apolloClient}>
        <StoreProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </StoreProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
