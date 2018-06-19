var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

// const awaitHandlerFactory = (middleware) => {
//     return async (req, res, next) => {
//         try {
//             await middleware(req, res, next)
//         } catch (err) {
//             next(err)
//         }
//     }
// }

// app.post('/save-network', awaitHandlerFactory(async (req, res) => {
//     console.log('api call works');
//     console.log(req.body.filePath);
//     const writeFileProcess=await fs.writeFile(req.body.filePath, req.body.fileContent, function (err) {
//         if (err) {
//             return console.log(err);
//         }

//         console.log("The file was saved!");
//         return 0;
//     });
//     res.status(200).json({
//         message: 'success write'
//     });
// }))

app.post('/save-network', (req, res) => {
    console.log('api call works');
    console.log(req.body.filePath);
    fs.writeFile(req.body.filePath, req.body.fileContent, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
        return 0;
    });
    res.status(200).json({
        message: 'success write'
    });
})

app.listen(8100,function () {
    console.log('listening on port 8100')
});