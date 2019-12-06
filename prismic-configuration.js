module.exports = {

  apiEndpointRepo1: 'http://repo1.wroom.test/api/v2',
  apiEndpointRepo2: 'http://repo2.wroom.test/api/v2',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver(doc) {
    if (doc.type == 'blog_home') {
      return '/blog';
    }
    if (doc.type == 'post') {
      return '/blog/' + encodeURIComponent(doc.uid);
    }
    return '/';
  }
};
