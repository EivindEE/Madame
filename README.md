Madame (MetA DatA Made Easy)
======
This tool is developed as part of my master thesis in information science and aims to provide a tool that will
allow developers to markup their web pages with semantic data in an easy way, that doens't require learing about
ontologies or RFD.

Homepage
========
You can view this projects homepage on [csaba.dyndns.ws:3000](http://csaba.dyndns.ws:3000)


Dependencies
============
This project runs on [node.js](http://nodejs.org), which needs to be installed to use the artefact.
Most of the dependencies are included in the `package.json` file and can be installed by running `npm install` in root project.

You must have perl installed, as well as the WordNet::QueryData and JSON package, these are available from CPAN.
The WordNet::QueryData package is dependent on having [WordNet](http://wordnet.princeton.edu/wordnet/download/current-version/) installed in the default location.

To get the css you need a scss compiler. You can for example use [compass](http://compass-style.org).

For dev there is also a dependency for Gruntfile.js which can be installed by running `[sudo] npm install -g grunt-cli`.
To make sure the web page is running the latest build, run grunt before opening the page.
To run grunt you need to have [compass](http://compass-style.org) installed.

https://github.com/gruntjs/grunt-contrib-compass
