# Flowdock Visualizations

### Screenshot

![Total Started by
User](https://raw.githubusercontent.com/Echo3ToEcho7/FlowdockVisualizations/master/screenshots/totalStartedByUser.png)

### Setup

```bash
npm install
npm install -g static
```

### Running

First you have to extract the data from Flowdock

```bash
node extractor.js <username> <password> [flow]
```

Example:

```bash
node extractor.js cobrien@rallydev.com myS3cret!!!
```

This will extract the data and put it in the web/data directory. After
you have extracted all of the information you can spin up the web
server.

```bash
cd web
static .
```

Now navigate to http://localhost:8080/
Profit!

### Adding more visualizations

TODO: Document this :)
