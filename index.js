const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const port = 3010;

const app = express();

const r_path = __dirname + '/views/';
app.use(express.static(r_path));

app.get('/video/:id', (req, res) => {
  const path = `assets/${req.params.id}/${req.params.id}.mp4`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res
        .status(416)
        .send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get('/captions/:id', (req, res) => {
  res.sendFile(__dirname + `/assets/${req.params.id}/${req.params.id}.vtt`);
});

app.get('/list', (req, res) => {
  res.sendFile(__dirname + '/assets/assets.json');
});

app.use(cors());

app.listen(port, () => {
  require('dns').lookup(require('os').host  name(), function (err, add, fam) {
    console.log('Listening on ' + add + ':4000');
  });
});
