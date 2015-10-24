# emag-score
This project represents a MEAN (Mongo/Express/Angular/Node) sample project. It has a typical MEAN structure and it is designed as a SPA (Single Page Application). Its main aim is to keep track of the history of product prices on the Romanian site [emag.ro](http://www.emag.ro/). It was built for learning purposes.

## Table of contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Frameworks and Libraries Used](#frameworks-and-libraries-used)
- [Scan Component](#scan-component)
- [User Authentication](#user-authentication)
- [Contributors](#contributors)
- [Useful Links](#useful-links)

##Installation
The project can be installed on either Windows or Linux OS. My recommendation would be the second choice (e.g. Ubuntu) as it offers better built-in support for the required project dependencies. In the case of Windows, there are some build problems which eventually require a VS installation for some [native libraries](http://stackoverflow.com/questions/27034592/node-gyp-build-error-for-bcrypt-module-in-windows-nt-6-1-7600-x86).

Another recommendation would be to previously install an IDE such as [Webstorm](https://www.jetbrains.com/webstorm/). It has a lot of features and it makes development easier. In this case, installing the project is straightforward:
* open WebStorm, then "Check out from Version Control" and select GitHub
* enter the "Git Repository URL" as follows: https://github.com/roby-rodriguez/emag-score.git and click Clone
* after the project is loaded into the workspace, open a new Terminal and enter `npm install`

The steps above assume you have previously installed [NPM](https://www.jetbrains.com/webstorm/help/installing-and-removing-external-software-using-node-package-manager.html) (Node Package Manager) and MongoDB (on [Windows](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/) or [Linux](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/))

Another option would be to use [Cloud9](https://c9.io/) where you can setup a workspace and deploy your project online.

##Project Structure
The initial intention was to build multiple versions of this application. The simplest one allows users to browse the available products and see their price history. Other, more complicated versions, allow user authentication and support of features such as favorites list and notifications (e.g. price drop). There are multiple branches for each such version.

The project has the following structure:
<!-- language:console -->

    app/
        business/
        common/
        config/
        middleware/
        model/
        routing/
        scripts/
    node_modules
    public/
        css/
        js/
            controllers/
            directives/
            factories/
            services/
            app.js
            ui.js
        libs/
        resources/
        templates/
        views/
        index.html
    .bowerrc
    .gitignore
    bower.json
    Gruntfile.js
    LICENSE
    package.json
    README.md
    scheduler.js
    server.js
    
The back-end of the project is found in `app`. It is organized as follows:
* business: contains the scan component which does the actual web-scrapping of the targeted [site](http://www.emag.ro/), it also contains scan-related files such as the captcha solver etc.
* common: utilities
* config: application configuration keys
* middleware: user authentication and validation
* model: contains the data model for the main entities - Category, Product and User
* routing: configures and exposes the available routes in the application
* scripts: configuration of third-party components

The application is launched by running the file `server.js`. The other source in the root directory, `scheduler.js`, represents the cron job associated to the scan component presented in the [next section](#scan-component).

The other files in the root directory mostly represent application configuration files. There are various tutorials and documentation sources who present their utility, see also [final section](#useful-links).

The front-end of the project is found in `public`. Its organization is the following:
* css: the styling used througout the application
* js: this is where the Angular source files are found, it is structured into the following directories:
 * controllers: controller source files (e.g. category, product, favorites etc.)
 * directives: useful/fancy stuff 
 * factories: factories used throughout the app
 * services: communication with the back-end
* resources: various static resources served by the web server (e.g. images)
* templates: reusable html components such as paginator, rating etc.
* views: the available views of the application

The main file of the front side of the application is `app.js` and it contains module configurations and routing. There is also an `ui.js` file used for purposes beyond the scope of Angular.

This side of the application was built using Bootstrap. The underlying theme used here is called 'SB Admin 2' and is freely available for download [here](http://startbootstrap.com/template-overviews/sb-admin-2/).

##Frameworks and Libraries Used
//TODO

##Scan Component
//TODO

##User Authentication
//TODO

##Contributors
This project can be freely distributed/extended by anyone. Please leave me a message if you have ideas of improvement. I am not responsible for any abuse/misuse of the ideas found here.

##Useful Links
Here are some of the links which may be useful in building further such SPA applications with MEAN: (structured by category)

Writing README.md files:
* https://github.com/tchapi/markdown-cheatsheet/blob/master/README.md
