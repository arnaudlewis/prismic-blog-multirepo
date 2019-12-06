"use strict";

/**
 * Module dependencies.
 */
const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const app = require('./config');
const PrismicConfig = require('./prismic-configuration');
const PORT = app.get('port');
const UIhelpers = require('./includes/UIhelpers');

app.listen(PORT, () => {
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

// Middleware to connect to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
  };

  // Add UI helpers to access them in templates
  res.locals.UIhelpers = UIhelpers;

  // Add PrismicDOM in locals to access them in templates
  res.locals.PrismicDOM = PrismicDOM;

  // Add the prismic.io API to the req
  Promise.all([
    Prismic.api(PrismicConfig.apiEndpointRepo1, { req }),
    Prismic.api(PrismicConfig.apiEndpointRepo2, { req })
  ]).then(([apiRepo1, apiRepo2]) => {
    req.prismic = { apiRepo1, apiRepo2 };
    next();
  }).catch((error) => {
    next(error.message);
  });
});

/*
 * -------------- Routes --------------
 */

/**
* Preconfigured prismic preview
*/
app.get('/preview', (req, res) => {
  const token = req.query.token;
  res.redirect(302, "/");
});


/**
* Route for blog homepage
*/
app.get(['/', '/blog'], (req, res) =>

  // Query the homepage
  req.prismic.apiRepo1.getSingle("blog_home").then((bloghome) => {

    // If a document is returned...
    if (bloghome) {
      // Query the posts
      req.prismic.apiRepo2.query(
        Prismic.Predicates.at("document.type", "post")
      ).then(function(response) {

        // Render the blog homepage
        res.render('bloghome', {
          bloghome,
          posts : response.results
        });
      });

    } else {
      // If a bloghome document is not returned, display the 404 page
      res.status(404).render('404');
    }
  })
);


/**
* Route for blog posts
*/
app.get('/blog/:uid', (req, res) => {

  // Define the uid from the url
  const uid = req.params.uid;

  // Query the post by its uid
  req.prismic.apiRepo2.getByUID('post', uid).then(post => {

    if (post) {
      // If a document is returned, render the post
      res.render('post', { post });

    // Else display the 404 page
    } else {
      res.status(404).render('404');
    }
  });
});
