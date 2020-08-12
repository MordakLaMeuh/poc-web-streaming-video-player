var http = require('http');
var ip = require('ip');
var url = require('url');
var fs = require('fs');

var conf = require('./server.json');

var sendStaticFile = function(pathname, response) {
    var extension = pathname.split('.').pop();
    response.writeHead(200, {'Content-Type': conf.http.mime[extension]});
    response.end(fs.readFileSync(conf.http.www + pathname))
}

var onRequest = function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;

    fs.lstat(conf.http.www + pathname, function(err, stats) {
        if (err) {
            console.log('error: file not exist:' + conf.http.www + pathname);
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end(fs.readFileSync(conf.http.html5_header)
                + '\n<body>'
                + '<center>Error 404</center>'
                + '<center><img src="data:image/jpeg;base64, ' + fs.readFileSync('Fy.jpg').toString('base64') + '" /></center>'
                + '\n</body>'
                + '\n</html>');

        } else if (stats.isDirectory()) {
            fs.lstat(conf.http.www + pathname + conf.http.index, function(err, stats) {
                if (err) {
                    console.log('affichage du dossier:' + pathname);

                    if (pathname[pathname.length-1] != '/') {
                        pathname += '/';
                    }

                    response.writeHead(404, {'Content-Type': 'text/html'});
                    fs.readdir(conf.http.www + pathname, function(err, files) {
                        if (!err) {
                            var i = pathname.split('/');

                            var backDir = '';
                            for (var j = 0; j < i.length - 2; j++) {
                                backDir += i[j] + '/';
                            }

                            var fileList = '';
                            for (var i = 0; i < files.length; i++) {
                                var type = fs.lstatSync(conf.http.www + pathname + files[i]).isDirectory() ? 'DIR' : 'RAW';
                                fileList += '\n<a href=' + pathname + '' + files[i] + '>' + type + ': ' + files[i] +'</a><br>';
                            }

                            response.end(fs.readFileSync(conf.http.html5_header)
                                + '\n<body>'
                                + '\n<H1>AFFICHAGE DU DOSSIER</H1>'
                                + '\n<a href=\'' + backDir + '\'>..</a><br>'
                                + fileList
                                + '\n</body>'
                                + '\n</html>');
                        } else {
                            response.end('Server critical error.');
                        }
                    });
                } else {
                    console.log('présence de index.html');
                    sendStaticFile(pathname + conf.http.index, response);
                }
            });
        } else {
            console.log('fichier nommé: ' + request.url + ' -> ' + pathname);
            sendStaticFile(pathname,response);
        }
    });
}

var httpServer = http.createServer(onRequest).listen(conf.http.port);

console.log('Idle Space Ship launched');
console.log(new Date() + '\nserver running on ' + ip.address() + ':' + conf.http.port);
